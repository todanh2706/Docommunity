package com.se.documinity.service;

import com.se.documinity.entity.DocumentCollaboratorEntity;
import com.se.documinity.entity.DocumentEntity;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.repository.DocumentCollaboratorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DocumentAccessService {
    public static final String ROLE_OWNER = "OWNER";
    public static final String ROLE_EDITOR = "EDITOR";
    public static final String ROLE_VIEWER = "VIEWER";
    public static final String ROLE_COMMENTER = "COMMENTER";

    private final DocumentCollaboratorRepository collaboratorRepository;

    public boolean isOwner(DocumentEntity doc, UserEntity user) {
        return doc.getUser() != null && user != null && doc.getUser().getId().equals(user.getId());
    }

    public Optional<DocumentCollaboratorEntity> findCollaborator(DocumentEntity doc, UserEntity user) {
        if (doc == null || user == null) {
            return Optional.empty();
        }
        return collaboratorRepository.findByDocumentIdAndUserId(doc.getId(), user.getId());
    }

    public String resolveRole(DocumentEntity doc, UserEntity user) {
        if (isOwner(doc, user)) {
            return ROLE_OWNER;
        }
        return findCollaborator(doc, user).map(DocumentCollaboratorEntity::getRole).orElse(null);
    }

    public boolean canView(DocumentEntity doc, UserEntity user) {
        if (Boolean.TRUE.equals(doc.getIsPublic())) {
            return true;
        }
        String role = resolveRole(doc, user);
        return canViewRole(role);
    }

    public boolean canEdit(DocumentEntity doc, UserEntity user) {
        String role = resolveRole(doc, user);
        return canEditRole(role);
    }

    public boolean canManageShare(DocumentEntity doc, UserEntity user) {
        return isOwner(doc, user);
    }

    public boolean canViewRole(String role) {
        String normalized = role != null ? role.toUpperCase() : null;
        return ROLE_OWNER.equals(normalized)
                || ROLE_EDITOR.equals(normalized)
                || ROLE_VIEWER.equals(normalized)
                || ROLE_COMMENTER.equals(normalized);
    }

    public boolean canEditRole(String role) {
        String normalized = role != null ? role.toUpperCase() : null;
        return ROLE_OWNER.equals(normalized) || ROLE_EDITOR.equals(normalized);
    }
}
