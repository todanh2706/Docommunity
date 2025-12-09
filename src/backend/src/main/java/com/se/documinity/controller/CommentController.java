package com.se.documinity.controller;

import com.se.documinity.dto.document.AddCommentRequest;
import com.se.documinity.dto.document.CommentResponse;
import com.se.documinity.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.se.documinity.dto.ResponseDTO;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {
    private final DocumentService documentService;

    // 🔒 POST /comments/{id}/replies
    @PostMapping("/{id}/replies")
    public ResponseEntity<ResponseDTO> replyToComment(
            @PathVariable Long id,
            @Valid @RequestBody AddCommentRequest request
    ) {
        CommentResponse response = documentService.replyToComment(id, request);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(response);
        responseDTO.setMessage("success");
        responseDTO.setDetail("Reply added successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

}
