package com.se.documinity.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AIService {

    private static final String OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.model.id}")
    private String modelId;

    @Value("${openrouter.site-url:http://localhost:3000}")
    private String siteUrl;

    @Value("${openrouter.site-name:Docommunity}")
    private String siteName;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String callOpenRouter(String systemInstruction, String userPrompt) {
        try {
            // Build headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            headers.set("HTTP-Referer", siteUrl);
            headers.set("X-Title", siteName);

            // Build request body (OpenAI-compatible format)
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", modelId);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", systemInstruction));
            messages.add(Map.of("role", "user", "content", userPrompt));
            requestBody.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Make request
            ResponseEntity<String> response = restTemplate.exchange(
                    OPENROUTER_API_URL,
                    HttpMethod.POST,
                    entity,
                    String.class);

            // Parse response
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            return "AI Error: " + e.getMessage();
        }
    }

    // --- 1. Refine (Improve / Summarize) ---
    public String refineText(String content, String action) {
        String systemRules;
        if ("summarize".equalsIgnoreCase(action)) {
            systemRules = "You are a professional summarizer. " +
                    "Create a concise summary of the provided text. " +
                    "Return ONLY the summary in Markdown.";
        } else {
            // Default: improve
            systemRules = "You are a professional technical editor. " +
                    "Rewrite the text to be clearer, more professional, and fix grammar. " +
                    "Do NOT add conversational filler. Return ONLY the refined Markdown.";
        }
        return callOpenRouter(systemRules, content);
    }

    // --- 2. Chat (With Document Context) ---
    public String chat(String message, String documentContext) {
        String systemRules = "You are a helpful assistant. Answer the user's question.";

        // Inject context if available
        String prompt = message;
        if (documentContext != null && !documentContext.isBlank()) {
            systemRules += " You have access to the following document content to help answer:\n---\n"
                    + documentContext + "\n---";
        }

        return callOpenRouter(systemRules, prompt);
    }

    // --- 3. Suggest Tags ---
    public String suggestTags(String content) {
        // Instructions to return a clean CSV format
        return callOpenRouter(
                "Analyze the text and return exactly 5 relevant tags, comma-separated (e.g. java, spring). Return ONLY the tags.",
                content);
    }

    // --- 4. Generate (Template/Type) ---
    public String generateContent(String type, String prompt) {
        String systemRules = "You are an expert content creator. " +
                "Generate a " + (type != null ? type : "document") + " based on the user's prompt. " +
                "Use Markdown formatting.";
        return callOpenRouter(systemRules, prompt);
    }
}