package com.se.documinity.dto.document;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RefineDocumentRequest {
    private String action;  // "improve" or "summarize"
    private String content; // Optional override content
}