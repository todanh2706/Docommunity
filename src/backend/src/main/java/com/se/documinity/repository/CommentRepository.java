package com.se.documinity.repository;

import com.se.documinity.entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    List<CommentEntity> findByDocument_IdOrderByCreatedAtAsc(Long documentId);
    List<CommentEntity> findByParentComment_IdOrderByCreatedAtAsc(Long parentId);

}
