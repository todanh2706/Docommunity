package com.se.documinity.service;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AIService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model.id}")
    private String modelId;

    private Client client;

    @PostConstruct
    public void init() {
        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    private String callGemini(String systemInstruction, String userPrompt) {
        try {
            GenerateContentConfig config = GenerateContentConfig.builder()
                    .systemInstruction(
                            Content.builder()
                                    .parts(Collections.singletonList(Part.builder().text(systemInstruction).build()))
                                    .build()
                    )
                    .build();

            GenerateContentResponse response = client.models.generateContent(
                    modelId,
                    userPrompt,
                    config
            );

            return response.text();
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
        return callGemini(systemRules, content);
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

        return callGemini(systemRules, prompt);
    }

    // --- 3. Suggest Tags ---
    public String suggestTags(String content) {
        // Instructions to return a clean CSV format
        return callGemini(
                "Analyze the text and return exactly 5 relevant tags, comma-separated (e.g. java, spring). Return ONLY the tags.",
                content
        );
    }

    // --- 4. Generate (Template/Type) ---
    public String generateContent(String type, String prompt) {
        String systemRules = "You are an expert content creator. " +
                "Generate a " + (type != null ? type : "document") + " based on the user's prompt. " +
                "Use Markdown formatting.";
        return callGemini(systemRules, prompt);
    }
}