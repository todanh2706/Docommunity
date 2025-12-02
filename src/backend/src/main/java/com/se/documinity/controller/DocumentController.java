package com.se.documinity.controller;

import com.se.documinity.dto.document.CreateDocumentRequest;
import com.se.documinity.dto.document.DocumentResponse;
import com.se.documinity.dto.document.UpdateDocumentRequest;
import com.se.documinity.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.print.Doc;
import java.util.List;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping
    public ResponseEntity<DocumentResponse> createDocument(@Valid @RequestBody CreateDocumentRequest request) {
        return ResponseEntity.ok(documentService.createDocument(request));
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getMyDocuments() {
        return ResponseEntity.ok(documentService.getMyDocuments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable Long id) {
        return ResponseEntity.ok(documentService.getDocument(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentResponse> updateDocument(@PathVariable Long id, @RequestBody UpdateDocumentRequest request) {
        return ResponseEntity.ok(documentService.updateDocument(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
}