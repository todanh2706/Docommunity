package com.se.documinity.dto.ai;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AutocompleteRequest {
    private String content;     // Full document content for context
    private String cursorText;  // Text before cursor (last ~100 chars)
    private Integer maxTokens;  // Max tokens for suggestion (default: 50)
}
