package com.se.documinity.dto.document;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CollaboratorResponse {
    private Long userId;
    private String email;
    private String name;
    private String role;
    private Boolean isOwner;
    private Boolean isMe;
}
