package com.se.documinity.controller;


import com.se.documinity.dto.comunity.PublicDocumentResponse;
import com.se.documinity.dto.comunity.ViewDocumentResponse;
import com.se.documinity.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.se.documinity.dto.ResponseDTO;

import java.util.List;

@RestController
@RequestMapping("/")
@RequiredArgsConstructor
public class CommunityController {
    private final DocumentService documentService;

    @GetMapping("/view-all-docs")
    public ResponseEntity<ResponseDTO> viewAllPublicDocuments(@RequestParam(name = "tagid", required = false) String tagId,
                                                                         @RequestParam(name = "page", defaultValue = "1") String page) {
        List<PublicDocumentResponse> publicDocumentResponses = documentService.getPublicDocuments(Long.valueOf(tagId), Integer.parseInt(page));
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(publicDocumentResponses);
        responseDTO.setMessage("success");
        responseDTO.setDetail("Public documents retrieved successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/view-doc")
    public ResponseEntity<ResponseDTO> viewDoc(
            @RequestParam("docid") Long docId
    ) {
        ViewDocumentResponse doc = documentService.getPublicDocument(docId);
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(doc);
        responseDTO.setMessage("success");
        responseDTO.setDetail("Document retrieved successfully");
        return ResponseEntity.ok(responseDTO);
    }
}
