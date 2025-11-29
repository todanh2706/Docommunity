package com.se.documinity.repository;

import com.se.documinity.entity.DocumentEntity;
import com.se.documinity.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {
    Optional<DocumentEntity> findDocumentByUser(UserEntity user);

    <S extends DocumentEntity> S save(S document);
}
