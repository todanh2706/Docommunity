package com.se.documinity.dto.documents;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateDocumentResponse {
    private Long id;
    private String title;
    private List<String> tags;
    private boolean isPublic;
}
