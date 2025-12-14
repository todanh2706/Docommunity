package com.se.documinity.controller;

import com.se.documinity.dto.ResponseDTO;
import com.se.documinity.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
public class TagController {
    private final TagService tagService;

    @GetMapping
    public ResponseEntity<ResponseDTO> getAllTags() {
        List<String> tags = tagService.getAllTags();
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(tags);
        responseDTO.setMessage("success");
        return ResponseEntity.ok(responseDTO);
    }
}
