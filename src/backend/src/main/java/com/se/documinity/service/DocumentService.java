package com.se.documinity.service;

import com.se.documinity.entity.DocumentEntity;
import com.se.documinity.exception.DocumentNotFoundException;
import com.se.documinity.exception.NotAuthorizedException;
import jakarta.validation.constraints.Future;
import lombok.RequiredArgsConstructor;

import com.se.documinity.dto.document.*;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.repository.DocumentRepository;
import com.se.documinity.repository.TagRepository;
import com.se.documinity.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.se.documinity.entity.TagEntity;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.se.documinity.exception.UserNotFoundException;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

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

    public Page<DocumentResponse> getAllPublicDocuments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DocumentEntity> docPage = documentRepository.findByIsPublicTrue(pageable);
        return docPage.map(this::mapToDocumentResponse);
    }

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

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!doc.getUser().getUsername().equals(currentUsername)) {
            throw new NotAuthorizedException("Not owner of document");
        }

        documentRepository.delete(doc);
    }

    private DocumentResponse mapToDocumentResponse(DocumentEntity doc) {
        List<String> tagNames = doc.getTags().stream()
                .map(TagEntity::getName)
                .collect(Collectors.toList());

        return new DocumentResponse(
                doc.getId(),
                doc.getTitle(),
                doc.getContent(),
                doc.getCreatedDate(),
                doc.getLastModified(),
                doc.getIsPublic(),
                tagNames,
                doc.getUser().getFullname(),
                doc.getUser().getId());
    }
}
