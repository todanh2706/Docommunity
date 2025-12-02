package com.se.documinity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.se.documinity.entity.TagEntity;
import java.util.Optional;

public interface TagRepository extends JpaRepository<TagEntity, Long> {
    Optional<TagEntity> findByName(String name);
}
