package com.se.documinity.dto.document;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ResolveShareResponse {
    private DocumentResponse document;
    private String role;
}
