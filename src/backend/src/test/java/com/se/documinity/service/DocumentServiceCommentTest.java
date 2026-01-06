package com.se.documinity.service;

import com.se.documinity.dto.document.CommentResponse;
import com.se.documinity.entity.CommentEntity;
import com.se.documinity.entity.DocumentEntity;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.repository.CommentRepository;
import com.se.documinity.repository.DocumentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DocumentServiceCommentTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private CommentRepository commentRepository;

    @InjectMocks
    private DocumentService documentService;

    @Test
    public void testGetCommentsWithReplies() {
        // Arrange
        Long docId = 1L;
        DocumentEntity doc = new DocumentEntity();
        doc.setId(docId);

        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setFullname("User");

        CommentEntity parent = new CommentEntity();
        parent.setId(1L);
        parent.setContent("Parent");
        parent.setDocument(doc);
        parent.setUser(user);
        parent.setCreatedAt(Instant.now());
        parent.setReplies(new HashSet<>());

        CommentEntity child = new CommentEntity();
        child.setId(2L);
        child.setContent("Child");
        child.setDocument(doc);
        child.setUser(user);
        child.setParentComment(parent); // Child points to parent
        child.setCreatedAt(Instant.now().plusSeconds(60));

        // Parent must contain child in its replies set for the recursion to work
        parent.getReplies().add(child);

        // Repository returns flat list of all comments for the doc
        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        when(commentRepository.findByDocument_IdOrderByCreatedAtAsc(docId)).thenReturn(Arrays.asList(parent, child));

        // Act
        List<CommentResponse> responses = documentService.getCommentsOfDocument(docId);

        // Assert
        assertEquals(1, responses.size()); // Only 1 root comment
        assertEquals("Parent", responses.get(0).getContent());
        assertEquals(1, responses.get(0).getReplies().size()); // 1 reply
        assertEquals("Child", responses.get(0).getReplies().get(0).getContent());
    }
}
