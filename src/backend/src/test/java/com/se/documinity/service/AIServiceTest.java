package com.se.documinity.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AIServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private AIService aiService;

    @BeforeEach
    public void setUp() {
        // Inject values using ReflectionTestUtils since they are @Value fields
        ReflectionTestUtils.setField(aiService, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(aiService, "modelId", "test-model-id");
        ReflectionTestUtils.setField(aiService, "siteUrl", "http://localhost:3000");
        ReflectionTestUtils.setField(aiService, "siteName", "Documinity");
        ReflectionTestUtils.setField(aiService, "restTemplate", restTemplate);
    }

    @Test
    public void testRefineText() throws JsonProcessingException {
        // Mock Response
        String mockResponseJson = "{\"choices\": [{\"message\": {\"content\": \"Refined text\"}}]}";
        ResponseEntity<String> responseEntity = new ResponseEntity<>(mockResponseJson, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        String result = aiService.refineText("Original text", "improve");

        assertEquals("Refined text", result);
    }

    @Test
    public void testChat() throws JsonProcessingException {
        // Mock Response
        String mockResponseJson = "{\"choices\": [{\"message\": {\"content\": \"AI answer\"}}]}";
        ResponseEntity<String> responseEntity = new ResponseEntity<>(mockResponseJson, HttpStatus.OK);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(responseEntity);

        String result = aiService.chat("Hello", "Context");

        assertEquals("AI answer", result);
    }
}
