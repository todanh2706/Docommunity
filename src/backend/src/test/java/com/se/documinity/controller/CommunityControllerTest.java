package com.se.documinity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.se.documinity.dto.PagedResponseDTO;
import com.se.documinity.dto.comunity.PublicDocumentResponse;
import com.se.documinity.dto.comunity.ViewDocumentResponse;
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
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CommunityController.class, excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                UserDetailsServiceAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
public class CommunityControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockBean
        private DocumentService documentService;

        @MockBean
        private JwtService jwtService;

        @MockBean
        private UserDetailsServiceImpl userDetailsService;

        @Test
        public void testViewAllPublicDocuments() throws Exception {
                PagedResponseDTO<PublicDocumentResponse> pagedResponse = new PagedResponseDTO<>();
                pagedResponse.setContent(Collections.emptyList());

                when(documentService.getPublicDocuments(any(), any(), anyInt(), anyString(), anyString()))
                                .thenReturn(pagedResponse); // Corrected

                // Since tagName is optional and I'm not passing it, mockito matcher might need
                // adjustment or call without param
                // But let's try with basic call first. If param is missing, it's null.
                when(documentService.getPublicDocuments(eq(null), eq(null), anyInt(), anyString(), anyString()))
                                .thenReturn(pagedResponse);

                mockMvc.perform(get("/view-all-docs"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.message").value("success"));
        }

        @Test
        public void testViewDoc() throws Exception {
                ViewDocumentResponse doc = ViewDocumentResponse.builder()
                                .id("1")
                                .title("Test Doc")
                                .build();

                when(documentService.getPublicDocument(1L)).thenReturn(doc);

                mockMvc.perform(get("/view-doc").param("docid", "1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.title").value("Test Doc"));
        }
}
