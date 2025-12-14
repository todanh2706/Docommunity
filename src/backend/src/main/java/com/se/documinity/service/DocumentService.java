package com.se.documinity.service;

import com.se.documinity.dto.comunity.PublicDocumentOwnerResponse;
import com.se.documinity.dto.comunity.PublicDocumentResponse;
import com.se.documinity.dto.comunity.ViewDocumentResponse;
import com.se.documinity.entity.CommentEntity;
import com.se.documinity.entity.DocumentEntity;
import com.se.documinity.exception.DocumentNotFoundException;
import com.se.documinity.exception.NotAuthorizedException;
import com.se.documinity.repository.CommentRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import com.se.documinity.dto.document.*;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.repository.DocumentRepository;
import com.se.documinity.repository.TagRepository;
import com.se.documinity.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.se.documinity.entity.TagEntity;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
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
        doc.setCreatedDate(LocalDate.now());
        doc.setLastModified(LocalDate.now());
        doc.setUser(user);
        doc.setTags(tagEntities);
        doc.setStatus(ACTIVE_STATUS);
        // 4. Save
        DocumentEntity savedDoc = documentRepository.save(doc);

        // 5. Convert to Response
        return mapToDocumentResponse(savedDoc);
    }

    public DocumentResponse getDocument(Long id) {
        DocumentEntity doc = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!doc.getIsPublic()) {
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            if (!doc.getUser().getUsername().equals(currentUsername)) {
                throw new NotAuthorizedException("You are not authorized to view this private document");
            }
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

    public com.se.documinity.dto.PagedResponseDTO<PublicDocumentResponse> getPublicDocuments(String tagName, int page) {
        if (page < 1)
            page = 1;

        var pageable = PageRequest.of(page - 1, PAGE_SIZE);

        org.springframework.data.domain.Page<DocumentEntity> pageDocs;
        if (tagName != null && !tagName.isEmpty()) {
            pageDocs = documentRepository
                    .findByIsPublicTrueAndStatusAndTags_Name(ACTIVE_STATUS, tagName, pageable);
        } else {
            pageDocs = documentRepository
                    .findByIsPublicTrueAndStatus(ACTIVE_STATUS, pageable);
        }

        List<PublicDocumentResponse> content = pageDocs.getContent().stream()
                .map(this::toPublicDocumentResponse)
                .toList();

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
        int max = 100;
        if (content.length() <= max)
            return content;
        return content.substring(0, max) + "...";
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
                        .name(doc.getUser() != null ? doc.getUser().getFullname() : "Unknown")
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

        // 2. Security Check: Ensure Current User is the Owner
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!doc.getUser().getUsername().equals(currentUsername)) {
            throw new NotAuthorizedException("Not owner of document");
        }

        // 3. Partial Update Logic

        if (request.getTitle() != null) {
            doc.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            doc.setContent(request.getContent());
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
        doc.setLastModified(LocalDate.now());
        documentRepository.save(doc);

        return mapToDocumentResponse(doc);
    }

    public void deleteDocument(Long id) {
        DocumentEntity doc = documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found"));
        System.out.println("Fetched document for deletion: " + doc.getTitle());
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("Current username: " + currentUsername);
        if (!doc.getUser().getUsername().equals(currentUsername)) {
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
        return CommentResponse.builder()
                .id(String.valueOf(comment.getId()))
                .content(comment.getContent())
                .author(CommentAuthorResponse.builder()
                        .id(String.valueOf(comment.getUser().getId()))
                        .name(comment.getUser().getFullname()) // chỉnh đúng field trong UserEntity
                        .build())
                .createdAt(comment.getCreatedAt().toString()) // 2025-12-03T10:00:00Z
                .build();
    }

    public List<CommentResponse> getCommentsOfDocument(Long documentId) {
        documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Not Found"));

        List<CommentEntity> comments = commentRepository.findByDocument_IdOrderByCreatedAtAsc(documentId);

        return comments.stream()
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
}
