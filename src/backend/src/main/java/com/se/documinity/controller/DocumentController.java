package com.se.documinity.controller;

import com.se.documinity.dto.document.*;
import com.se.documinity.exception.NoContentToRefineException;
import com.se.documinity.service.AIService;
import com.se.documinity.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;

import javax.print.Doc;
import java.util.List;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final AIService aiService;

    @PostMapping
    public ResponseEntity<DocumentResponse> createDocument(@Valid @RequestBody CreateDocumentRequest request) {
        return ResponseEntity.ok(documentService.createDocument(request));
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getMyDocuments() {
        return ResponseEntity.ok(documentService.getMyDocuments());
    }

    @GetMapping("/public")
    public ResponseEntity<Page<DocumentResponse>> getPublicDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(documentService.getAllPublicDocuments(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocument(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponse> updateDocument(@PathVariable Long id,
            @RequestBody UpdateDocumentRequest request) {
        return ResponseEntity.ok(documentService.updateDocument(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/refine")
    public ResponseEntity<RefineDocumentResponse> refineDocument(
            @PathVariable Long id,
            @RequestBody RefineDocumentRequest request) {

        // 1. Fetch doc securely (will throw 403/404 if invalid)
        DocumentResponse doc = documentService.getDocument(id);

        // 2. Decide: Use override content OR existing doc content
        String textToRefine = (request.getContent() != null && !request.getContent().isBlank())
                ? request.getContent()
                : doc.getContent();

        if (textToRefine == null || textToRefine.isBlank()) {
            throw new NoContentToRefineException("No content to refine");
        }

        // 3. Call AI
        String result = aiService.refineText(textToRefine, request.getAction());

        return ResponseEntity.ok(new RefineDocumentResponse(result));
    }
}