package com.se.documinity.dto.ai;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ChatRequest {
    private Long documentId; // Optional context
    private String message;
}
