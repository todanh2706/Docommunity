package com.se.documinity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.se.documinity.dto.ai.ChatRequest;
import com.se.documinity.dto.ai.GenerateRequest;
import com.se.documinity.dto.ai.TagRequest;
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

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AIController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        UserDetailsServiceAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
public class AIControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AIService aiService;

    @MockBean
    private DocumentService documentService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    public void testChat() throws Exception {
        ChatRequest request = new ChatRequest();
        request.setMessage("Hello");

        when(aiService.chat(eq("Hello"), anyString())).thenReturn("AI Reply");

        mockMvc.perform(post("/ai/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value("AI Reply"));
    }

    @Test
    public void testSuggestTags() throws Exception {
        TagRequest request = new TagRequest();
        request.setContent("Some content");

        when(aiService.suggestTags("Some content")).thenReturn("tag1, tag2");

        mockMvc.perform(post("/ai/tags")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tags[0]").value("tag1"))
                .andExpect(jsonPath("$.tags[1]").value("tag2"));
    }

    @Test
    public void testGenerate() throws Exception {
        GenerateRequest request = new GenerateRequest();
        request.setType("blog");
        request.setPrompt("Topic");

        when(aiService.generateContent("blog", "Topic")).thenReturn("Generated Content");

        mockMvc.perform(post("/ai/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Generated Content"));
    }
}
