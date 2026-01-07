package com.se.documinity.collab;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.se.documinity.entity.DocumentEntity;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.exception.DocumentNotFoundException;
import com.se.documinity.exception.NotAuthorizedException;
import com.se.documinity.repository.DocumentRepository;
import com.se.documinity.repository.UserRepository;
import com.se.documinity.service.DocumentAccessService;
import com.se.documinity.service.JwtService;
import com.se.documinity.util.ShareTokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import name.fraser.neil.plaintext.diff_match_patch;
import name.fraser.neil.plaintext.diff_match_patch.Patch;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedList;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class DocumentCollabHandler extends TextWebSocketHandler {
    private static final String SESSION_DOC_ID = "docId";
    private static final String SESSION_ROLE = "role";
    private static final String SESSION_CLIENT_ID = "clientId";
    private static final String SESSION_NAME = "name";
    private static final String SESSION_COLOR = "color";
    private static final String ACTIVE_STATUS = "ACTIVE";
    private static final int MAX_SESSIONS = 10;

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final DocumentAccessService accessService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<Long, DocRoom> rooms = new ConcurrentHashMap<>();
    private final Map<Long, ScheduledFuture<?>> pendingSaves = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    // dmp instance for patching
    private final diff_match_patch dmp = new diff_match_patch();

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, Object> payload = objectMapper.readValue(message.getPayload(),
                new TypeReference<Map<String, Object>>() {
                });
        String type = asString(payload.get("type"));
        if ("join".equals(type)) {
            handleJoin(session, payload);
            return;
        }
        if ("content-update".equals(type)) {
            handleContentUpdate(session, payload);
            return;
        }
        if ("patch-update".equals(type)) {
            handlePatchUpdate(session, payload);
            return;
        }
        if ("cursor-update".equals(type)) {
            handleCursorUpdate(session, payload);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long docId = (Long) session.getAttributes().get(SESSION_DOC_ID);
        if (docId == null) {
            return;
        }
        DocRoom room = rooms.get(docId);
        if (room != null) {
            room.sessions.remove(session.getId());
            if (room.sessions.isEmpty()) {
                saveRoom(docId);
                rooms.remove(docId);
            } else {
                broadcastPresence(room);
            }
        }
    }

    private void handleJoin(WebSocketSession session, Map<String, Object> payload) throws Exception {
        String authToken = asString(payload.get("authToken"));
        String shareToken = asString(payload.get("shareToken"));
        String clientId = asString(payload.get("clientId"));
        String displayName = asString(payload.get("displayName"));
        String color = asString(payload.get("color"));
        Long docId = toLong(payload.get("docId"));
        if (clientId == null || clientId.isBlank()) {
            clientId = session.getId();
        }
        if (color == null || color.isBlank()) {
            color = "#3b82f6";
        }

        DocumentEntity doc;
        String role;
        if (shareToken != null && !shareToken.isBlank()) {
            String hash = ShareTokenUtil.hashToken(shareToken);
            doc = documentRepository.findByShareTokenHashAndShareEnabledTrue(hash)
                    .orElseThrow(() -> new DocumentNotFoundException("Share link not found"));
            if (!ACTIVE_STATUS.equals(doc.getStatus())) {
                throw new NotAuthorizedException("Forbidden");
            }
            role = doc.getShareRole() != null ? doc.getShareRole() : DocumentAccessService.ROLE_EDITOR;
            docId = doc.getId();
            if (displayName == null || displayName.isBlank()) {
                displayName = "Guest";
            }
        } else if (authToken != null && !authToken.isBlank()) {
            String username = jwtService.extractUsername(authToken);
            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new NotAuthorizedException("Invalid user"));
            doc = documentRepository.findById(docId)
                    .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
            if (!ACTIVE_STATUS.equals(doc.getStatus())) {
                throw new NotAuthorizedException("Forbidden");
            }
            if (!accessService.canView(doc, user)) {
                throw new NotAuthorizedException("Forbidden");
            }
            role = accessService.resolveRole(doc, user);
            if (role == null && Boolean.TRUE.equals(doc.getIsPublic())) {
                role = DocumentAccessService.ROLE_VIEWER;
            }
            displayName = user.getFullname() != null ? user.getFullname() : user.getUsername();
        } else {
            throw new NotAuthorizedException("Missing auth");
        }

        DocRoom room = rooms.computeIfAbsent(docId, id -> new DocRoom(
                doc.getContent() != null ? doc.getContent() : "",
                doc.getContentVersion() != null ? doc.getContentVersion() : 0L));

        if (room.sessions.size() >= MAX_SESSIONS) {
            sendError(session, "Room is full");
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }

        SessionInfo info = new SessionInfo(clientId, displayName, color, role);
        room.sessions.put(session.getId(), new SessionState(session, info));
        session.getAttributes().put(SESSION_DOC_ID, docId);
        session.getAttributes().put(SESSION_ROLE, role);
        session.getAttributes().put(SESSION_CLIENT_ID, clientId);
        session.getAttributes().put(SESSION_NAME, displayName);
        session.getAttributes().put(SESSION_COLOR, color);

        sendMessage(session, Map.of(
                "type", "joined",
                "docId", docId,
                "content", room.content,
                "serverVersion", room.version,
                "role", role,
                "users", room.getUsers()));
        broadcastPresence(room);
    }

    private void handleContentUpdate(WebSocketSession session, Map<String, Object> payload) throws Exception {
        Long docId = (Long) session.getAttributes().get(SESSION_DOC_ID);
        if (docId == null) {
            return;
        }
        String role = (String) session.getAttributes().get(SESSION_ROLE);
        if (!accessService.canEditRole(role)) {
            sendError(session, "Not allowed to edit");
            return;
        }
        DocRoom room = rooms.get(docId);
        if (room == null) {
            return;
        }
        String content = asString(payload.get("content"));
        String clientId = (String) session.getAttributes().get(SESSION_CLIENT_ID);
        synchronized (room) {
            room.content = content != null ? content : "";
            room.version += 1;
        }

        // Broadcast full content
        broadcast(room, Map.of(
                "type", "content-update",
                "docId", docId,
                "content", room.content,
                "serverVersion", room.version,
                "from", clientId));
        scheduleSave(docId);
    }

    private void handlePatchUpdate(WebSocketSession session, Map<String, Object> payload) throws Exception {
        Long docId = (Long) session.getAttributes().get(SESSION_DOC_ID);
        if (docId == null) {
            return;
        }
        String role = (String) session.getAttributes().get(SESSION_ROLE);
        if (!accessService.canEditRole(role)) {
            sendError(session, "Not allowed to edit");
            return;
        }
        DocRoom room = rooms.get(docId);
        if (room == null) {
            return;
        }
        String patchesText = asString(payload.get("patches"));
        String clientId = (String) session.getAttributes().get(SESSION_CLIENT_ID);

        synchronized (room) {
            // Apply patch to server state
            try {
                LinkedList<Patch> patches = (LinkedList<Patch>) dmp.patch_fromText(patchesText);
                Object[] results = dmp.patch_apply(patches, room.content);
                room.content = (String) results[0];
                room.version += 1;
                // We could check boolean[] results[1] for failures, but LWW accepts best effort
            } catch (Exception e) {
                System.err.println("Patch failed for doc " + docId + ": " + e.getMessage());
                // Fallback: If patch fails, we might request a full sync, but for now just
                // ignore
                return;
            }
        }

        // Broadcast patch to others (Bandwidth efficient download)
        broadcast(room, Map.of(
                "type", "patch-update",
                "docId", docId,
                "patches", patchesText,
                "serverVersion", room.version,
                "from", clientId));

        scheduleSave(docId);
    }

    private void handleCursorUpdate(WebSocketSession session, Map<String, Object> payload) throws Exception {
        Long docId = (Long) session.getAttributes().get(SESSION_DOC_ID);
        if (docId == null) {
            return;
        }
        DocRoom room = rooms.get(docId);
        if (room == null) {
            return;
        }
        int selectionStart = toInt(payload.get("selectionStart"));
        int selectionEnd = toInt(payload.get("selectionEnd"));
        String clientId = (String) session.getAttributes().get(SESSION_CLIENT_ID);
        String name = (String) session.getAttributes().get(SESSION_NAME);
        String color = (String) session.getAttributes().get(SESSION_COLOR);

        broadcast(room, Map.of(
                "type", "cursor-update",
                "docId", docId,
                "selectionStart", selectionStart,
                "selectionEnd", selectionEnd,
                "user", Map.of(
                        "clientId", clientId,
                        "name", name,
                        "color", color)));
    }

    private void broadcastPresence(DocRoom room) throws Exception {
        broadcast(room, Map.of(
                "type", "presence",
                "users", room.getUsers()));
    }

    private void broadcast(DocRoom room, Map<String, Object> message) throws Exception {
        String json = objectMapper.writeValueAsString(message);
        TextMessage textMessage = new TextMessage(json);
        for (SessionState state : room.sessions.values()) {
            WebSocketSession ws = state.session;
            if (ws.isOpen()) {
                ws.sendMessage(textMessage);
            }
        }
    }

    private void sendMessage(WebSocketSession session, Map<String, Object> message) throws Exception {
        String json = objectMapper.writeValueAsString(message);
        session.sendMessage(new TextMessage(json));
    }

    private void sendError(WebSocketSession session, String error) throws Exception {
        sendMessage(session, Map.of(
                "type", "error",
                "message", error));
    }

    private void scheduleSave(Long docId) {
        ScheduledFuture<?> existing = pendingSaves.get(docId);
        if (existing != null) {
            existing.cancel(false);
        }
        ScheduledFuture<?> future = scheduler.schedule(() -> saveRoom(docId), 2, TimeUnit.SECONDS);
        pendingSaves.put(docId, future);
    }

    private void saveRoom(Long docId) {
        pendingSaves.remove(docId);
        DocRoom room = rooms.get(docId);
        if (room == null) {
            return;
        }
        try {
            DocumentEntity doc = documentRepository.findById(docId)
                    .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
            doc.setContent(room.content);
            LocalDateTime savedAt = LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
            doc.setLastModified(savedAt);
            doc.setContentVersion(room.version);
            documentRepository.save(doc);

            // Broadcast save confirmation to all clients in the room
            try {
                broadcast(room, Map.of(
                        "type", "saved",
                        "docId", docId,
                        "version", room.version,
                        "savedAt", savedAt.toString()));
            } catch (Exception broadcastError) {
                System.err.println(
                        "Failed to broadcast save confirmation for doc " + docId + ": " + broadcastError.getMessage());
            }
        } catch (Exception e) {
            System.err.println("Failed to save document " + docId + ": " + e.getMessage());
            e.printStackTrace();
            // Notify clients of save failure
            try {
                broadcast(room, Map.of(
                        "type", "save-error",
                        "docId", docId,
                        "message", "Failed to save: " + e.getMessage()));
            } catch (Exception broadcastError) {
                System.err.println("Failed to broadcast save error: " + broadcastError.getMessage());
            }
        }
    }

    private String asString(Object value) {
        return value != null ? String.valueOf(value) : null;
    }

    private Long toLong(Object value) {
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value != null) {
            return Long.parseLong(value.toString());
        }
        return null;
    }

    private int toInt(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        if (value != null) {
            return Integer.parseInt(value.toString());
        }
        return 0;
    }

    private static final class DocRoom {
        private volatile String content;
        private volatile long version;
        private final Map<String, SessionState> sessions = new ConcurrentHashMap<>();

        private DocRoom(String content, long version) {
            this.content = content;
            this.version = version;
        }

        private List<Map<String, Object>> getUsers() {
            List<Map<String, Object>> users = new ArrayList<>();
            for (SessionState state : sessions.values()) {
                SessionInfo info = state.info;
                users.add(Map.of(
                        "clientId", info.clientId,
                        "name", info.name,
                        "color", info.color,
                        "role", info.role));
            }
            return users;
        }
    }

    private static final class SessionState {
        private final WebSocketSession session;
        private final SessionInfo info;

        private SessionState(WebSocketSession session, SessionInfo info) {
            this.session = session;
            this.info = info;
        }
    }

    private static final class SessionInfo {
        private final String clientId;
        private final String name;
        private final String color;
        private final String role;

        private SessionInfo(String clientId, String name, String color, String role) {
            this.clientId = clientId;
            this.name = name;
            this.color = color;
            this.role = role;
        }
    }
}
