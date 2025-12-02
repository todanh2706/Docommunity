package com.se.documinity.dto.ai;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class GenerateRequest {
    private String type;   // e.g., "blog", "email"
    private String prompt;
}
