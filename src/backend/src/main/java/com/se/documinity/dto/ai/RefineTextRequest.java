package com.se.documinity.dto.ai;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RefineTextRequest {
    private String text;
    private String instruction;
}
