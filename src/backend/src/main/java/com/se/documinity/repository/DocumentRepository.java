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

    List<DocumentEntity> findByUserId(Long userId);

    Page<DocumentEntity> findByIsPublicTrue(Pageable pageable);
}
