package com.se.documinity.dto.comunity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PublicDocumentOwnerResponse {
    private Long id;
    private String name;
    @com.fasterxml.jackson.annotation.JsonProperty("avatar_url")
    private String avatarUrl;
}
