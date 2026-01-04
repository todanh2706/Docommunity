package com.se.documinity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.se.documinity.dto.document.CreateDocumentRequest;
import com.se.documinity.dto.document.DocumentResponse;
import com.se.documinity.service.AIService;
import com.se.documinity.service.DocumentService;
import com.se.documinity.service.JwtService;
import com.se.documinity.service.UserDetailsServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DocumentController.class, excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                UserDetailsServiceAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
public class DocumentControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private DocumentService documentService;

        @MockBean
        private AIService aiService;

        @MockBean
        private JwtService jwtService;

        @MockBean
        private UserDetailsServiceImpl userDetailsService;

        @Test
        public void testCreateDocument() throws Exception {
                CreateDocumentRequest request = new CreateDocumentRequest();
                request.setTitle("New Doc");
                request.setContent("Content");

                DocumentResponse response = new DocumentResponse();
                response.setId(1L);
                response.setTitle("New Doc");

                when(documentService.createDocument(any(CreateDocumentRequest.class))).thenReturn(response);

                mockMvc.perform(post("/documents")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.title").value("New Doc"));
        }
}
