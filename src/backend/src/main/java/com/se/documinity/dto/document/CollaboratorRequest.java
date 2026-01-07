package com.se.documinity.dto.document;

import lombok.Data;

@Data
public class CollaboratorRequest {
    private String email;
    private String role;
}
