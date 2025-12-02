package com.se.documinity.controller;

import com.se.documinity.dto.ai.*;
import com.se.documinity.dto.document.DocumentResponse;
import com.se.documinity.service.AIService;
import com.se.documinity.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;
    private final DocumentService documentService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody ChatRequest request) {
        String context = "";

        if (request.getDocumentId() != null) {
            try {
                DocumentResponse doc = documentService.getDocument(request.getDocumentId());
                context = doc.getContent();
            } catch (Exception e) {
                // If doc not found or unauthorized, we proceed without context (or could return 404)
                // For a chat feature, it's often better to just warn the user or ignore the context.
            }
        }

        String reply = aiService.chat(request.getMessage(), context);
        return ResponseEntity.ok(Map.of("reply", reply));
    }

    // 2. Suggest Tags
    @PostMapping("/tags")
    public ResponseEntity<Map<String, Object>> suggestTags(@RequestBody TagRequest request) {
        String csvTags = aiService.suggestTags(request.getContent());

        String[] tagsArray = csvTags.split(",");
        for (int i = 0; i < tagsArray.length; i++) {
            tagsArray[i] = tagsArray[i].trim();
        }

        return ResponseEntity.ok(Map.of("tags", tagsArray));
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, String>> generate(@RequestBody GenerateRequest request) {
        String content = aiService.generateContent(request.getType(), request.getPrompt());
        return ResponseEntity.ok(Map.of("content", content));
    }
}