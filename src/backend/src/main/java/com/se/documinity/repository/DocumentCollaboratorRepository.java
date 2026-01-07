package com.se.documinity.repository;

import com.se.documinity.entity.DocumentCollaboratorEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentCollaboratorRepository extends JpaRepository<DocumentCollaboratorEntity, Long> {
    Optional<DocumentCollaboratorEntity> findByDocumentIdAndUserId(Long documentId, Long userId);

    List<DocumentCollaboratorEntity> findByDocumentId(Long documentId);

    List<DocumentCollaboratorEntity> findByUserId(Long userId);

    void deleteByDocumentIdAndUserId(Long documentId, Long userId);
}
