package com.se.documinity.service;

import com.se.documinity.dto.comunity.PublicDocumentOwnerResponse;
import com.se.documinity.dto.comunity.PublicDocumentResponse;
import com.se.documinity.dto.comunity.ViewDocumentResponse;
import com.se.documinity.entity.CommentEntity;
import com.se.documinity.entity.DocumentCollaboratorEntity;
import com.se.documinity.entity.DocumentEntity;
import com.se.documinity.exception.DocumentNotFoundException;
import com.se.documinity.exception.NotAuthorizedException;
import com.se.documinity.repository.CommentRepository;
import com.se.documinity.repository.DocumentCollaboratorRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import com.se.documinity.dto.document.*;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.repository.DocumentRepository;
import com.se.documinity.repository.TagRepository;
import com.se.documinity.repository.UserRepository;
import com.se.documinity.util.ShareTokenUtil;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.se.documinity.entity.TagEntity;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.se.documinity.exception.UserNotFoundException;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final CommentRepository commentRepository;
    private final DocumentCollaboratorRepository documentCollaboratorRepository;
    private final DocumentAccessService documentAccessService;
    private final EmailService emailService;

    private static final int PAGE_SIZE = 10;
    private static final String ACTIVE_STATUS = "ACTIVE";

    public DocumentResponse createDocument(CreateDocumentRequest request) {
        // 1. Get Current User
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // 2. Process Tags
        Set<TagEntity> tagEntities = new HashSet<>();
        if (request.getTags() != null) {
            for (String tagName : request.getTags()) {
                // Check if tag exists, if not, create it
                TagEntity tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> {
                            TagEntity newTag = new TagEntity();
                            newTag.setName(tagName);
                            return tagRepository.save(newTag);
                        });
                tagEntities.add(tag);
            }
        }

        // 3. Create Document Entity
        DocumentEntity doc = new DocumentEntity();
        doc.setTitle(request.getTitle());
        doc.setContent(request.getContent());
        doc.setIsPublic(request.getIsPublic() != null ? request.getIsPublic() : false);
        doc.setCreatedDate(LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")));
        doc.setLastModified(LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")));
        doc.setUser(user);
        doc.setTags(tagEntities);
        doc.setStatus(ACTIVE_STATUS);
        doc.setShareEnabled(false);
        doc.setShareRole(DocumentAccessService.ROLE_EDITOR);
        doc.setContentVersion(0L);
        // 4. Save
        DocumentEntity savedDoc = documentRepository.save(doc);

        // 5. Send notification to followers if document is public
        if (Boolean.TRUE.equals(savedDoc.getIsPublic())) {
            notifyFollowersOfNewPost(user, savedDoc);
        }

        // 6. Convert to Response
        return mapToDocumentResponse(savedDoc);
    }

    /**
     * Send email notification to all followers when a user publishes a new document
     */
    private void notifyFollowersOfNewPost(UserEntity author, DocumentEntity document) {
        Set<UserEntity> followers = author.getFollowers();
        if (followers == null || followers.isEmpty()) {
            return;
        }

        String authorName = author.getFullname() != null ? author.getFullname() : author.getUsername();
        
        // Collect follower emails and names
        List<String[]> followerData = followers.stream()
                .filter(f -> f.getEmail() != null && !f.getEmail().isBlank())
                .map(f -> new String[]{f.getEmail(), f.getFullname() != null ? f.getFullname() : f.getUsername()})
                .collect(Collectors.toList());

        emailService.sendNewPostNotificationToFollowers(followerData, authorName, document.getTitle(), document.getId());
    }

    public DocumentResponse getDocument(Long id) {
        DocumentEntity doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        UserEntity user = null;
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (currentUsername != null && !currentUsername.equals("anonymousUser")) {
            user = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new UserNotFoundException("User not found"));
        }
        if (!documentAccessService.canView(doc, user)) {
            throw new NotAuthorizedException("You are not authorized to view this document");
        }

        return mapToDocumentResponse(doc);
    }

    public List<DocumentResponse> getMyDocuments() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<DocumentEntity> docs = documentRepository.findByUserId(user.getId());

        // 4. Convert List<Document> to List<DocumentResponse>
        return docs.stream()
                .map(this::mapToDocumentResponse) // reusing the helper method we wrote earlier
                .collect(Collectors.toList());
    }

    public com.se.documinity.dto.PagedResponseDTO<PublicDocumentResponse> getPublicDocuments(String tagName,
            String search, int page, String sortBy, String sortDir) {
        if (page < 1)
            page = 1;

        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(
                sortDir.equalsIgnoreCase("asc") ? org.springframework.data.domain.Sort.Direction.ASC
                        : org.springframework.data.domain.Sort.Direction.DESC,
                sortBy.equalsIgnoreCase("title") ? "title" : "createdDate" // Default to createdDate for 'date'
        );

        var pageable = PageRequest.of(page - 1, PAGE_SIZE, sort);

        org.springframework.data.domain.Page<DocumentEntity> pageDocs = documentRepository
                .searchPublicDocuments(ACTIVE_STATUS, tagName, search, pageable);

        List<PublicDocumentResponse> content = pageDocs.getContent().stream()
                .map(this::toPublicDocumentResponse)
                .toList();

        // Optimization: checking isLiked for each doc is inefficient if we do it one by
        // one against DB.
        // For now keep existing logic but wrapped in toPublicDocumentResponse which
        // does it simply.

        return new com.se.documinity.dto.PagedResponseDTO<>(
                content,
                pageDocs.getNumber() + 1,
                pageDocs.getSize(),
                pageDocs.getTotalElements(),
                pageDocs.getTotalPages(),
                pageDocs.isLast());
    }

    private PublicDocumentResponse toPublicDocumentResponse(DocumentEntity doc) {
        String snippet = buildSnippet(doc.getContent());

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isLiked = false;
        if (currentUsername != null && !currentUsername.equals("anonymousUser")) {
            isLiked = doc.getLikedByUsers().stream()
                    .anyMatch(u -> u.getUsername().equals(currentUsername));
        }

        return PublicDocumentResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .snipetContent(snippet)
                .owner(PublicDocumentOwnerResponse.builder()
                        .id(doc.getUser() != null ? doc.getUser().getId() : null)
                        .name(doc.getUser() != null ? doc.getUser().getFullname() : "Unknown")
                        .avatarUrl(doc.getUser() != null ? doc.getUser().getAvatarUrl() : null)
                        .build())
                .lastModified(doc.getLastModified() != null ? doc.getLastModified() : doc.getCreatedDate())
                .likesCount(doc.getLikedByUsers() != null ? doc.getLikedByUsers().size() : 0)
                .commentsCount(doc.getComments() != null ? doc.getComments().size() : 0)
                .isLiked(isLiked)
                .isBookmarked(doc.getMarkedByUsers().stream().anyMatch(u -> u.getUsername().equals(currentUsername)))
                .tags(doc.getTags().stream().map(TagEntity::getName).collect(Collectors.toList()))
                .build();
    }

    public List<PublicDocumentResponse> getPopularDocuments(int limit) {
        PageRequest pageable = PageRequest.of(0, limit);
        List<DocumentEntity> popularDocs = documentRepository.findMostPopularDocuments(pageable);
        return popularDocs.stream().map(this::toPublicDocumentResponse).toList();
    }

    private String buildSnippet(String content) {
        if (content == null)
            return "";
        int max = 300; // Increased for better content preview
        if (content.length() <= max)
            return content;

        // Find a safe cut point that doesn't break markdown syntax
        String snippet = content.substring(0, max);

        // Check if we're in the middle of a markdown image: ![...](...)
        int lastImageStart = snippet.lastIndexOf("![");
        if (lastImageStart != -1) {
            // Check if the image syntax is complete (has closing parenthesis after it)
            int closingParen = snippet.indexOf(")", lastImageStart);
            if (closingParen == -1) {
                // Image syntax is incomplete, cut before it
                snippet = snippet.substring(0, lastImageStart);
            }
        }

        // Check if we're in the middle of a markdown link: [...](...)
        int lastLinkStart = snippet.lastIndexOf("[");
        if (lastLinkStart != -1 && (lastImageStart == -1 || lastLinkStart > lastImageStart)) {
            // Make sure it's not part of an image (which starts with !)
            if (lastLinkStart == 0 || snippet.charAt(lastLinkStart - 1) != '!') {
                int closingParen = snippet.indexOf(")", lastLinkStart);
                if (closingParen == -1) {
                    snippet = snippet.substring(0, lastLinkStart);
                }
            }
        }

        return snippet.trim() + "...";
    }

    public ViewDocumentResponse getPublicDocument(Long documentId) {
        DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Not Found"));

        // Không public hoặc không ACTIVE → 403
        if (!Boolean.TRUE.equals(doc.getIsPublic()) || !ACTIVE_STATUS.equals(doc.getStatus())) {
            throw new NotAuthorizedException("Forbidden");
        }

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isLiked = false;
        if (currentUsername != null && !currentUsername.equals("anonymousUser")) {
            isLiked = doc.getLikedByUsers().stream()
                    .anyMatch(u -> u.getUsername().equals(currentUsername));
        }

        return ViewDocumentResponse.builder()
                .id(String.valueOf(doc.getId()))
                .title(doc.getTitle())
                .content(doc.getContent())
                .owner(PublicDocumentOwnerResponse.builder()
                        .id(doc.getUser() != null ? doc.getUser().getId() : null)
                        .name(doc.getUser() != null ? (doc.getUser().getFullname() != null ? doc.getUser().getFullname()
                                : doc.getUser().getUsername()) : "Unknown")
                        .avatarUrl(doc.getUser() != null ? doc.getUser().getAvatarUrl() : null)
                        .build())
                .likesCount(doc.getLikedByUsers() != null ? doc.getLikedByUsers().size() : 0)
                .commentsCount(doc.getComments() != null ? doc.getComments().size() : 0)
                .createdDate(doc.getCreatedDate().toString())
                .isLiked(isLiked)
                .tags(doc.getTags().stream().map(TagEntity::getName).collect(Collectors.toList()))
                .build();
    }

    // public Page<DocumentResponse> getAllPublicDocuments(int page, int size) {
    // Pageable pageable = PageRequest.of(page, size);
    // Page<DocumentEntity> docPage =
    // documentRepository.findByIsPublicTrue(pageable);
    // return docPage.map(this::mapToDocumentResponse);
    // }

    public DocumentResponse updateDocument(Long id, UpdateDocumentRequest request) {
        // 1. Find the document
        DocumentEntity doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // 2. Security Check: Ensure Current User can edit
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (!documentAccessService.canEdit(doc, user)) {
            throw new NotAuthorizedException("Not allowed to edit document");
        }

        // 3. Partial Update Logic
        // Track if document is being published (from private to public)
        boolean wasPrivate = !Boolean.TRUE.equals(doc.getIsPublic());
        boolean willBePublic = Boolean.TRUE.equals(request.getIsPublic());

        if (request.getTitle() != null) {
            doc.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            doc.setContent(request.getContent());
            doc.setContentVersion(doc.getContentVersion() != null ? doc.getContentVersion() + 1 : 1L);
        }
        if (request.getIsPublic() != null) {
            doc.setIsPublic(request.getIsPublic());
        }
        // Update Tags (If provided, replace old tags with new ones)
        if (request.getTags() != null) {
            Set<TagEntity> newTags = new HashSet<>();
            for (String tagName : request.getTags()) {
                TagEntity tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> {
                            TagEntity newTag = new TagEntity();
                            newTag.setName(tagName);
                            return tagRepository.save(newTag);
                        });
                newTags.add(tag);
            }
            doc.setTags(newTags);
        }
        doc.setLastModified(LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")));
        documentRepository.save(doc);

        // 4. Send notification to followers if document is being published
        if (wasPrivate && willBePublic) {
            notifyFollowersOfNewPost(doc.getUser(), doc);
        }

        return mapToDocumentResponse(doc);
    }

    public void deleteDocument(Long id) {
        DocumentEntity doc = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
        System.out.println("Fetched document for deletion: " + doc.getTitle());
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("Current username: " + currentUsername);
        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (!documentAccessService.isOwner(doc, user)) {
            throw new NotAuthorizedException("Not owner of document");
        }
        System.out.println("Authorization check passed for user: " + currentUsername);

        try {
            documentRepository.delete(doc);
            System.out.println("Document deleted successfully: " + doc.getTitle());
        } catch (Exception e) {
            System.out.println("🔥 Error when deleting document: " + e.getClass().getName()
                    + " - " + e.getMessage());
            e.printStackTrace(); // In stack trace ra console
            throw e; // cho GlobalExceptionHandler xử lý tiếp
        }
    }

    private DocumentResponse mapToDocumentResponse(DocumentEntity doc) {
        List<String> tagNames = doc.getTags().stream()
                .map(TagEntity::getName)
                .collect(Collectors.toList());

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        boolean isLiked = false;
        boolean isBookmarked = false;
        if (currentUsername != null && !currentUsername.equals("anonymousUser")) {
            isLiked = doc.getLikedByUsers().stream()
                    .anyMatch(u -> u.getUsername().equals(currentUsername));
            isBookmarked = doc.getMarkedByUsers().stream()
                    .anyMatch(u -> u.getUsername().equals(currentUsername));
        }

        return new DocumentResponse(
                doc.getId(),
                doc.getTitle(),
                doc.getContent(),
                doc.getCreatedDate(),
                doc.getLastModified(),
                doc.getIsPublic(),
                tagNames,
                doc.getUser().getFullname(),
                doc.getUser().getId(),
                doc.getUser().getAvatarUrl(),
                doc.getLikedByUsers() != null ? doc.getLikedByUsers().size() : 0,
                doc.getComments() != null ? doc.getComments().size() : 0,
                isLiked,
                isBookmarked);
    }

    public int likeDocument(Long documentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));

        doc.getLikedByUsers().add(user);

        documentRepository.save(doc);

        return doc.getLikedByUsers().size();
    }

    public int deleteLikeDocument(Long documentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("Current username: " + username); // Debugging line
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        System.out.println("Fetched user: " + user.getUsername()); // Debugging line
        DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
        if (doc.getLikedByUsers() == null || !doc.getLikedByUsers().contains(user)) {
            throw new RuntimeException("You have not liked this document");
        }
        System.out.println("Document liked by users before removal: " + doc.getLikedByUsers().size()); // Debugging line
        doc.getLikedByUsers().remove(user);
        System.out.println("Document liked by users after removal: " + doc.getLikedByUsers().size()); // Debugging line

        documentRepository.save(doc);

        return doc.getLikedByUsers().size();
    }

    public CommentResponse addComment(Long documentId, AddCommentRequest request) {
        // 1. Tìm document, không có -> 404
        DocumentEntity document = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Not Found"));

        // 2. Lấy user đang login
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // 3. Tạo comment entity
        CommentEntity comment = new CommentEntity();
        comment.setContent(request.getContent());
        comment.setDocument(document);
        comment.setUser(currentUser);
        comment.setCreatedAt(Instant.now());

        CommentEntity saved = commentRepository.save(comment);

        // 4. Map sang DTO để trả về
        return mapToCommentResponse(saved);
    }

    private CommentResponse mapToCommentResponse(CommentEntity comment) {
        List<CommentResponse> replies = null;
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            replies = comment.getReplies().stream()
                    .map(this::mapToCommentResponse)
                    .sorted((c1, c2) -> c1.getCreatedAt().compareTo(c2.getCreatedAt()))
                    .toList();
        }

        return CommentResponse.builder()
                .id(String.valueOf(comment.getId()))
                .content(comment.getContent())
                .author(CommentAuthorResponse.builder()
                        .id(String.valueOf(comment.getUser().getId()))
                        .name(comment.getUser().getFullname() != null ? comment.getUser().getFullname()
                                : comment.getUser().getUsername())
                        .avatarUrl(comment.getUser().getAvatarUrl())
                        .build())
                .createdAt(comment.getCreatedAt().toString())
                .replies(replies)
                .build();
    }

    public List<CommentResponse> getCommentsOfDocument(Long documentId) {
        documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Not Found"));

        List<CommentEntity> comments = commentRepository.findByDocument_IdOrderByCreatedAtAsc(documentId);

        // Filter root comments (those without parent)
        return comments.stream()
                .filter(c -> c.getParentComment() == null)
                .map(this::mapToCommentResponse)
                .toList();
    }

    public CommentResponse replyToComment(Long commentId, AddCommentRequest request) {
        // 1. Tìm comment cha, không có -> 404
        CommentEntity parent = commentRepository.findById(commentId)
                .orElseThrow(() -> new DocumentNotFoundException("Not Found"));

        // 2. Lấy user đang đăng nhập
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // 3. Tạo reply
        CommentEntity reply = new CommentEntity();
        reply.setContent(request.getContent());
        reply.setDocument(parent.getDocument()); // cùng document với comment cha
        reply.setUser(currentUser);
        reply.setParentComment(parent);
        reply.setCreatedAt(Instant.now());

        CommentEntity saved = commentRepository.save(reply);

        return mapToCommentResponse(saved);
    }

    public void markDocument(Long documentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));

        if (!doc.getMarkedByUsers().removeIf(u -> u.getId().equals(user.getId()))) {
            doc.getMarkedByUsers().add(user);
        }

        documentRepository.save(doc);
    }

    public List<DocumentResponse> getBookmarkedDocuments() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        List<DocumentEntity> docs = documentRepository.findByMarkedByUsersContaining(user);

        return docs.stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());
    }

    public List<DocumentResponse> getSharedDocuments() {
        UserEntity user = requireCurrentUser();
        List<DocumentCollaboratorEntity> collaborations = documentCollaboratorRepository.findByUserId(user.getId());
        Map<Long, DocumentEntity> uniqueDocs = new LinkedHashMap<>();

        for (DocumentCollaboratorEntity collaboration : collaborations) {
            DocumentEntity doc = collaboration.getDocument();
            if (doc == null) {
                continue;
            }
            if (!ACTIVE_STATUS.equals(doc.getStatus())) {
                continue;
            }
            uniqueDocs.putIfAbsent(doc.getId(), doc);
        }

        return uniqueDocs.values().stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());
    }

    public ShareLinkResponse createShareLink(Long documentId) {
        DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
        UserEntity user = requireCurrentUser();
        if (!documentAccessService.canManageShare(doc, user)) {
            throw new NotAuthorizedException("Not allowed to share document");
        }

        if (Boolean.TRUE.equals(doc.getShareEnabled()) && doc.getShareToken() != null) {
            return new ShareLinkResponse(true, doc.getShareToken());
        }

        String token = ShareTokenUtil.generateToken();
        doc.setShareEnabled(true);
        if (doc.getShareRole() == null) {
            doc.setShareRole(DocumentAccessService.ROLE_EDITOR);
        }
        doc.setShareTokenHash(ShareTokenUtil.hashToken(token));
        doc.setShareToken(token);
        documentRepository.save(doc);

        return new ShareLinkResponse(true, token);
    }

    public ShareLinkResponse getShareStatus(Long documentId) {
        DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
        UserEntity user = requireCurrentUser();
        if (!documentAccessService.canManageShare(doc, user)) {
            throw new NotAuthorizedException("Not allowed to view share status");
        }
        return new ShareLinkResponse(Boolean.TRUE.equals(doc.getShareEnabled()),
                Boolean.TRUE.equals(doc.getShareEnabled()) ? doc.getShareToken() : null);
    }

    public void disableShareLink(Long documentId) {
        DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
        UserEntity user = requireCurrentUser();
        if (!documentAccessService.canManageShare(doc, user)) {
            throw new NotAuthorizedException("Not allowed to disable share link");
        }
        doc.setShareEnabled(false);
        doc.setShareTokenHash(null);
        doc.setShareToken(null);
        documentRepository.save(doc);
    }

    public ResolveShareResponse resolveShareToken(String token) {
        if (token == null || token.isBlank()) {
            throw new DocumentNotFoundException("Share token is required");
        }
        String hash = ShareTokenUtil.hashToken(token);
        DocumentEntity doc = documentRepository.findByShareTokenHashAndShareEnabledTrue(hash)
                .orElseThrow(() -> new DocumentNotFoundException("Share link not found"));
        if (!ACTIVE_STATUS.equals(doc.getStatus())) {
            throw new NotAuthorizedException("Forbidden");
        }
        String role = doc.getShareRole() != null ? doc.getShareRole() : DocumentAccessService.ROLE_EDITOR;
        return new ResolveShareResponse(mapToDocumentResponse(doc), role);
    }

    public List<CollaboratorResponse> listCollaborators(Long documentId) {
        DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
        UserEntity currentUser = requireCurrentUser();
        if (!documentAccessService.canManageShare(doc, currentUser)) {
            throw new NotAuthorizedException("Not allowed to view collaborators");
        }

        UserEntity owner = doc.getUser();
        List<CollaboratorResponse> responses = documentCollaboratorRepository.findByDocumentId(documentId).stream()
                .filter(c -> owner == null || !c.getUser().getId().equals(owner.getId()))
                .map(c -> toCollaboratorResponse(doc, c.getUser(), c.getRole(), currentUser))
                .collect(Collectors.toList());

        if (owner != null) {
            responses.add(0, toCollaboratorResponse(doc, owner, DocumentAccessService.ROLE_OWNER, currentUser));
        }

        return responses;
    }

    public CollaboratorResponse addCollaborator(Long documentId, CollaboratorRequest request) {
        DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
        UserEntity currentUser = requireCurrentUser();
        if (!documentAccessService.canManageShare(doc, currentUser)) {
            throw new NotAuthorizedException("Not allowed to add collaborator");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new NotAuthorizedException("Email is required");
        }

        UserEntity target = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (documentAccessService.isOwner(doc, target)) {
            return toCollaboratorResponse(doc, target, DocumentAccessService.ROLE_OWNER, currentUser);
        }

        DocumentCollaboratorEntity collaborator = documentCollaboratorRepository
                .findByDocumentIdAndUserId(documentId, target.getId())
                .orElseGet(DocumentCollaboratorEntity::new);
        collaborator.setDocument(doc);
        collaborator.setUser(target);
        String role = request.getRole() != null ? request.getRole().toUpperCase() : DocumentAccessService.ROLE_EDITOR;
        collaborator.setRole(role);
        if (collaborator.getCreatedAt() == null) {
            collaborator.setCreatedAt(LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")));
        }
        collaborator.setUpdatedAt(LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")));
        documentCollaboratorRepository.save(collaborator);

        return toCollaboratorResponse(doc, target, collaborator.getRole(), currentUser);
    }

    public CollaboratorResponse updateCollaboratorRole(Long documentId, Long userId, String role) {
        DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
        UserEntity currentUser = requireCurrentUser();
        if (!documentAccessService.canManageShare(doc, currentUser)) {
            throw new NotAuthorizedException("Not allowed to update collaborator");
        }
        if (doc.getUser() != null && doc.getUser().getId().equals(userId)) {
            return toCollaboratorResponse(doc, doc.getUser(), DocumentAccessService.ROLE_OWNER, currentUser);
        }

        DocumentCollaboratorEntity collaborator = documentCollaboratorRepository
                .findByDocumentIdAndUserId(documentId, userId)
                .orElseThrow(() -> new DocumentNotFoundException("Collaborator not found"));
        if (role != null) {
            collaborator.setRole(role.toUpperCase());
        }
        collaborator.setUpdatedAt(LocalDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")));
        documentCollaboratorRepository.save(collaborator);

        return toCollaboratorResponse(doc, collaborator.getUser(), collaborator.getRole(), currentUser);
    }

    public void removeCollaborator(Long documentId, Long userId) {
        DocumentEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
        UserEntity currentUser = requireCurrentUser();
        if (!documentAccessService.canManageShare(doc, currentUser)) {
            throw new NotAuthorizedException("Not allowed to remove collaborator");
        }
        if (doc.getUser() != null && doc.getUser().getId().equals(userId)) {
            throw new NotAuthorizedException("Cannot remove owner");
        }
        documentCollaboratorRepository.deleteByDocumentIdAndUserId(documentId, userId);
    }

    private CollaboratorResponse toCollaboratorResponse(DocumentEntity doc, UserEntity user, String role,
            UserEntity currentUser) {
        boolean isOwner = doc.getUser() != null && user != null && doc.getUser().getId().equals(user.getId());
        boolean isMe = currentUser != null && user != null && currentUser.getId().equals(user.getId());
        return new CollaboratorResponse(
                user != null ? user.getId() : null,
                user != null ? user.getEmail() : null,
                user != null ? user.getFullname() : null,
                role,
                isOwner,
                isMe);
    }

    private UserEntity requireCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }
}
