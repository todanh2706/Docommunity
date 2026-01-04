package com.se.documinity.service;

import com.se.documinity.dto.document.CreateDocumentRequest;
import com.se.documinity.dto.document.DocumentResponse;
import com.se.documinity.entity.DocumentEntity;
import com.se.documinity.entity.TagEntity;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.repository.DocumentRepository;
import com.se.documinity.repository.TagRepository;
import com.se.documinity.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private DocumentService documentService;

    @BeforeEach
    public void setUp() {
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    public void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    public void testCreateDocument() {
        // Arrange
        String username = "testuser";
        CreateDocumentRequest request = new CreateDocumentRequest();
        request.setTitle("Test Doc");
        request.setContent("Content");
        request.setTags(Collections.singletonList("Java"));
        request.setIsPublic(true);

        UserEntity user = new UserEntity();
        user.setId(1L);
        user.setUsername(username);
        user.setFullname("Test User");

        TagEntity tag = new TagEntity();
        tag.setName("Java");

        DocumentEntity savedDoc = new DocumentEntity();
        savedDoc.setId(1L);
        savedDoc.setTitle("Test Doc");
        savedDoc.setContent("Content");
        savedDoc.setUser(user); // Important: set user
        savedDoc.setTags(new HashSet<>(Collections.singletonList(tag)));
        savedDoc.setCreatedDate(LocalDate.now());
        savedDoc.setLastModified(LocalDate.now());
        savedDoc.setIsPublic(true);
        savedDoc.setLikedByUsers(new HashSet<>());
        savedDoc.setMarkedByUsers(new HashSet<>());
        savedDoc.setComments(new HashSet<>());

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(username);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(tagRepository.findByName("Java")).thenReturn(Optional.of(tag));
        when(documentRepository.save(any(DocumentEntity.class))).thenReturn(savedDoc);

        // Act
        DocumentResponse response = documentService.createDocument(request);

        // Assert
        assertNotNull(response);
        assertEquals("Test Doc", response.getTitle());
        assertEquals("Test User", response.getAuthorName());
    }

    @Test
    public void testGetDocument() {
        // Arrange
        Long docId = 1L;
        DocumentEntity doc = new DocumentEntity();
        doc.setId(docId);
        doc.setTitle("Test Doc");
        doc.setIsPublic(true);
        doc.setUser(new UserEntity());
        doc.getUser().setFullname("Owner");
        doc.setTags(new HashSet<>());
        doc.setLikedByUsers(new HashSet<>());
        doc.setMarkedByUsers(new HashSet<>());
        doc.setComments(new HashSet<>());

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        // Note: getDocument might check 'isLiked', which needs SecurityContext if user
        // is logged in
        // Default SecurityContext mock might return null name, let's treat it as
        // anonymous if needed,
        // or just set up authentication mock.
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("anonymousUser");

        // Act
        DocumentResponse response = documentService.getDocument(docId);

        // Assert
        assertEquals("Test Doc", response.getTitle());
    }
}
