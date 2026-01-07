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

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Constructor với timeout configuration
    public AIService() {
        // Tạo RestTemplate với timeout 25 giây (dưới Render's 30s limit)
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = 
            new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);  // 5 giây để connect
        factory.setReadTimeout(25000);    // 25 giây để đọc response
        this.restTemplate = new RestTemplate(factory);
    }

    private String callOpenRouter(String systemInstruction, String userPrompt) {
        return callOpenRouter(systemInstruction, userPrompt, null);
    }

    private String callOpenRouter(String systemInstruction, String userPrompt, Integer maxTokens) {
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

            // Add max_tokens if specified (useful for autocomplete)
            if (maxTokens != null && maxTokens > 0) {
                requestBody.put("max_tokens", maxTokens);
            }

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
    // --- 1. Refine (Improve / Summarize) ---
    public String refineText(String content, String action) {
        String baseSystemRules = "You are a professional technical editor. " +
                "Your task is to improve the provided text based on the user's instruction. " +
                "CRITICAL: You MUST preserve the original language of the text. " +
                "If the text is in Vietnamese, you MUST respond in Vietnamese. " +
                "If the text is in English, you MUST respond in English. " +
                "Do NOT translate under any circumstances unless explicitly asked. " +
                "Do NOT include conversational filler. Return ONLY the result.";

        String specificInstruction;
        if ("summarize".equalsIgnoreCase(action)) {
            specificInstruction = "Summarize the text concisely.";
        } else if ("improve".equalsIgnoreCase(action) || action == null || action.isBlank()) {
            specificInstruction = "Rewrite the text to be clearer, more professional, and fix grammar.";
        } else {
            // Use the custom instruction from the frontend
            specificInstruction = action;
        }

        String finalPrompt = baseSystemRules + "\n\nInstruction: " + specificInstruction;
        return callOpenRouter(finalPrompt, content);
    }

    // --- 2. Chat (With Document Context and App Knowledge) ---
    // Load app knowledge from external file for easy editing
    private String appKnowledge;

    @jakarta.annotation.PostConstruct
    public void loadAppKnowledge() {
        try {
            org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource(
                    "instruction.md");
            appKnowledge = new String(resource.getInputStream().readAllBytes(),
                    java.nio.charset.StandardCharsets.UTF_8);
            System.out.println("Loaded app knowledge from instruction.md (" + appKnowledge.length() + " chars)");
        } catch (Exception e) {
            System.err.println("Failed to load instruction.md: " + e.getMessage());
            appKnowledge = "You are Docommunity AI Assistant. Help users with their questions about the app.";
        }
    }

    public String chat(String message, String documentContext) {
        String systemRules = appKnowledge + "\n\nAnswer the user's question based on the app knowledge above. " +
                "Do NOT include conversational filler like 'Sure!', 'Of course!', 'Here you go!'. " +
                "Keep your response language the SAME as the user's question language." +
                "Give precise answer, not too long";

        // Inject document context if available
        if (documentContext != null && !documentContext.isBlank()) {
            systemRules += "\n\nThe user is currently viewing this document:\n---\n"
                    + documentContext + "\n---";
        }

        return callOpenRouter(systemRules, message);
    }

    // --- 3. Suggest Tags ---
    public String suggestTags(String content) {
        // Instructions to return a clean CSV format
        return callOpenRouter(
                "Analyze the text and return exactly 5 relevant tags, comma-separated (e.g. java, spring). " +
                        "Return ONLY the tags, no explanations, no filler text. " +
                        "Keep tag language matching the content language.",
                content);
    }

    // --- 4. Generate (Template/Type) ---
    public String generateContent(String type, String prompt) {
        String systemRules = "You are an expert content creator. " +
                "Generate a " + (type != null ? type : "document") + " based on the user's prompt. " +
                "Use Markdown formatting. " +
                "IMPORTANT: Do NOT include any conversational filler like 'Here is your...', 'Here's a...', or 'Sure, here you go'. "
                +
                "Return ONLY the generated content itself, nothing else. " +
                "Keep the output language the SAME as the input language (e.g., if the prompt is in Vietnamese, respond in Vietnamese).";
        return callOpenRouter(systemRules, prompt);
    }

    // --- 5. Autocomplete (Writing Suggestions) ---
    public String autocomplete(String content, String cursorText, Integer maxTokens) {
        String systemRules = "You are an AI writing assistant. " +
                "Based on the context provided, suggest the next sentence or phrase to continue the text. " +
                "Return ONLY the suggested text continuation, nothing else. " +
                "Do NOT include any conversational filler or explanations. " +
                "Keep suggestions concise (1-2 sentences max). " +
                "Match the writing style and language of the context EXACTLY. " +
                "If no good suggestion is possible, return an empty string.";

        String prompt = "Document context:\n" + (content != null ? content : "") +
                "\n\nContinue from: \"" + (cursorText != null ? cursorText : "") + "\"";

        String result = callOpenRouter(systemRules, prompt, maxTokens != null ? maxTokens : 50);

        // Clean up the result - remove quotes if AI wrapped them
        if (result != null) {
            result = result.trim();
            if (result.startsWith("\"") && result.endsWith("\"")) {
                result = result.substring(1, result.length() - 1);
            }
        }

        return result != null ? result : "";
    }
}