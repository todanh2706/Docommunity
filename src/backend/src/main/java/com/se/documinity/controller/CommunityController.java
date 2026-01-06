package com.se.documinity.controller;

import com.se.documinity.dto.comunity.PublicDocumentResponse;
import com.se.documinity.dto.comunity.ViewDocumentResponse;
import com.se.documinity.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.se.documinity.dto.ResponseDTO;

@RestController
@RequestMapping("/")
@RequiredArgsConstructor
public class CommunityController {
    private final DocumentService documentService;

    @GetMapping("/view-all-docs")
    public ResponseEntity<ResponseDTO> viewAllPublicDocuments(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) String tagName,
            @RequestParam(required = false) String search) {
        com.se.documinity.dto.PagedResponseDTO<PublicDocumentResponse> documents = documentService
                .getPublicDocuments(tagName, search, page, "date", "desc");
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(documents);
        responseDTO.setMessage("success");
        responseDTO.setDetail("Public documents retrieved successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/view-doc")
    public ResponseEntity<ResponseDTO> viewDoc(
            @RequestParam("docid") Long docId) {
        ViewDocumentResponse doc = documentService.getPublicDocument(docId);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(doc);
        responseDTO.setMessage("success");
        responseDTO.setDetail("Document retrieved successfully");
        return ResponseEntity.ok(responseDTO);
    }
}
