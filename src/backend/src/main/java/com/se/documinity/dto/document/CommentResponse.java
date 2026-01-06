package com.se.documinity.dto.document;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private String id;
    private String content;

    private CommentAuthorResponse author;

    @JsonProperty("created_at")
    private String createdAt;

    private java.util.List<CommentResponse> replies;
}
