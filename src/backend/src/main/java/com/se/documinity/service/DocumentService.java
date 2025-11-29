package com.se.documinity.service;

import lombok.RequiredArgsConstructor;

import com.se.documinity.dto.documents.CreateDocumentRequest;
import com.se.documinity.dto.documents.CreateDocumentResponse;
import com.se.documinity.entity.DocumentEntity;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.repository.DocumentRepository;
import com.se.documinity.repository.TagRepository;
import com.se.documinity.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.se.documinity.entity.TagEntity;
import java.time.LocalDate;
import com.se.documinity.exception.TagNotFoundException;
import com.se.documinity.exception.UserNotFoundException;

@Service
@RequiredArgsConstructor
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;

    public CreateDocumentResponse createDocument(CreateDocumentRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        DocumentEntity document = new DocumentEntity();
        document.setTitle(request.getTitle());
        document.setContent(request.getContent());
        document.setCreatedDate(LocalDate.now());
        document.setLastModified(LocalDate.now());
        document.setIsPublic(request.isPublic());
        document.setUser(user);

        if (request.getTags() != null && !request.getTags().isEmpty()) {
            String tagName = request.getTags().get(0);
            TagEntity tag = tagRepository.findByName(tagName)
                    .orElseThrow(() -> new TagNotFoundException("Tag not found"));
            document.setTag(tag);
        }

        DocumentEntity savedDocument = documentRepository.save(document);

        return new CreateDocumentResponse(
                savedDocument.getId(),
                savedDocument.getTitle(),
                request.getTags(),
                savedDocument.getIsPublic());
    }
}
