package com.se.documinity.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import com.se.documinity.service.DocumentService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.se.documinity.dto.documents.CreateDocumentRequest;
import com.se.documinity.dto.documents.CreateDocumentResponse;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    @PostMapping("/")
    public ResponseEntity<CreateDocumentResponse> createDocument(@Valid @RequestBody CreateDocumentRequest request) {
        System.out.println("Received request: " + request);
        System.out.println("Tags: " + request.getTags());
        return ResponseEntity.ok(documentService.createDocument(request));
    }
}
