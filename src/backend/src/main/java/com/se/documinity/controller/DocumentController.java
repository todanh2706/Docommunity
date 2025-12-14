package com.se.documinity.controller;

import com.se.documinity.dto.document.*;
import com.se.documinity.dto.comunity.PublicDocumentResponse;
import com.se.documinity.exception.NoContentToRefineException;
import com.se.documinity.service.AIService;
import com.se.documinity.service.DocumentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.se.documinity.dto.ResponseDTO;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final AIService aiService;

    @PostMapping
    public ResponseEntity<ResponseDTO> createDocument(@Valid @RequestBody CreateDocumentRequest request) {
        DocumentResponse documentResponse = documentService.createDocument(request);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(documentResponse);
        responseDTO.setMessage("success");
        responseDTO.setDetail("Document created successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping
    public ResponseEntity<ResponseDTO> getMyDocuments() {
        List<DocumentResponse> documents = documentService.getMyDocuments();
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(documents);
        responseDTO.setMessage("success");
        responseDTO.setDetail("Documents retrieved successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/public")
    public ResponseEntity<ResponseDTO> getPublicDocuments(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String tagName) {
        com.se.documinity.dto.PagedResponseDTO<PublicDocumentResponse> documents = documentService
                .getPublicDocuments(tagName, page);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(documents);
        responseDTO.setMessage("success");
        responseDTO.setDetail("Public documents retrieved successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/popular")
    public ResponseEntity<ResponseDTO> getPopularDocuments(@RequestParam(defaultValue = "4") int limit) {
        List<PublicDocumentResponse> documents = documentService.getPopularDocuments(limit);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(documents);
        responseDTO.setMessage("success");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDTO> getDocument(@PathVariable Long id) {
        DocumentResponse documentResponse = documentService.getDocument(id);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(documentResponse);
        responseDTO.setMessage("success");
        responseDTO.setDetail("Document retrieved successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseDTO> updateDocument(@PathVariable Long id,
            @RequestBody UpdateDocumentRequest request) {
        DocumentResponse documentResponse = documentService.updateDocument(id, request);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(documentResponse);
        responseDTO.setMessage("success");
        responseDTO.setDetail("Document updated successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDTO> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setMessage("success");
        responseDTO.setDetail("Document deleted successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/{id}/refine")
    public ResponseEntity<ResponseDTO> refineDocument(
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

        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(new RefineDocumentResponse(result));
        responseDTO.setMessage("success");
        responseDTO.setDetail("Document refined successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ResponseDTO> addLike(@PathVariable Long id) {
        int likesCount = documentService.likeDocument(id);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(Map.of(
                "message", "Liked",
                "likesCount", likesCount));
        responseDTO.setMessage("success");
        responseDTO.setDetail("Like added successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<ResponseDTO> deleteLike(@PathVariable Long id) {
        int likesCount = documentService.deleteLikeDocument(id);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(Map.of(
                "message", "UnLiked",
                "likesCount", likesCount));
        responseDTO.setMessage("success");
        responseDTO.setDetail("Like removed successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ResponseDTO> addComment(
            @PathVariable Long id,
            @Valid @RequestBody AddCommentRequest request) {

        CommentResponse response = documentService.addComment(id, request);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(response);
        responseDTO.setMessage("success");
        responseDTO.setDetail("Comment added successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ResponseDTO> getComments(@PathVariable Long id) {
        List<CommentResponse> comments = documentService.getCommentsOfDocument(id);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(comments);
        responseDTO.setMessage("success");
        responseDTO.setDetail("Comments retrieved successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/{id}/mark")
    public ResponseEntity<ResponseDTO> markDocument(@PathVariable Long id) {
        documentService.markDocument(id);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setMessage("success");
        responseDTO.setDetail("Document marked successfully");
        return ResponseEntity.ok(responseDTO);
    }

}
