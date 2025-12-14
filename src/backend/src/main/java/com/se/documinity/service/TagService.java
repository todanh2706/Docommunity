package com.se.documinity.service;

import com.se.documinity.entity.TagEntity;
import com.se.documinity.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;

    public List<String> getAllTags() {
        return tagRepository.findAll().stream()
                .map(TagEntity::getName)
                .collect(Collectors.toList());
    }
}
