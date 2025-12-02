package com.se.documinity.dto.document;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class UpdateDocumentRequest {
    private String title;
    private String content;
    private List<String> tags;
    private Boolean isPublic;
}