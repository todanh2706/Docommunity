package com.se.documinity.service;

import com.se.documinity.entity.TagEntity;
import com.se.documinity.repository.TagRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private TagService tagService;

    @Test
    public void testGetAllTags() {
        // Arrange
        TagEntity tag1 = new TagEntity();
        tag1.setName("Java");
        TagEntity tag2 = new TagEntity();
        tag2.setName("Spring Boot");

        when(tagRepository.findAll()).thenReturn(Arrays.asList(tag1, tag2));

        // Act
        List<String> result = tagService.getAllTags();

        // Assert
        assertEquals(2, result.size());
        assertEquals("Java", result.get(0));
        assertEquals("Spring Boot", result.get(1));
    }
}
