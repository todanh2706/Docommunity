package com.se.documinity.repository;

import com.se.documinity.entity.DocumentEntity;
import com.se.documinity.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {
    Optional<DocumentEntity> findDocumentByUser(UserEntity user);

    List<DocumentEntity> findByUserIdAndIsPublicTrue(Long userId);

    List<DocumentEntity> findByMarkedByUsersContaining(UserEntity user);

    List<DocumentEntity> findByUserId(Long userId);

    Page<DocumentEntity> findByIsPublicTrueAndStatus(String status, Pageable pageable);

    Page<DocumentEntity> findByIsPublicTrueAndStatusAndTags_Id(String status, Long tagId, Pageable pageable);

    Page<DocumentEntity> findByIsPublicTrueAndStatusAndTags_Name(String status, String tagName, Pageable pageable);

    void deleteById(Long id);

    Page<DocumentEntity> findByIsPublicTrue(Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM DocumentEntity d LEFT JOIN d.likedByUsers l WHERE d.isPublic = true GROUP BY d ORDER BY COUNT(l) DESC")
    List<DocumentEntity> findMostPopularDocuments(Pageable pageable);
}
