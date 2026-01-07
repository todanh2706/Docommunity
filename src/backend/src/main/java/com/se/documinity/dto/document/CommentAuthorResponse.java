package com.se.documinity.dto.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentAuthorResponse {
    private String id;
    private String name;
    @com.fasterxml.jackson.annotation.JsonProperty("avatar")
    private String avatarUrl;
}
