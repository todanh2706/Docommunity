package com.se.documinity.dto.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentResponse {
    private Long id;
    private String title;
    private String content;
    private java.time.LocalDateTime createdDate;
    private java.time.LocalDateTime lastModified;
    private Boolean isPublic;
    private List<String> tags;
    private String authorName;
    private Long authorId;
    @com.fasterxml.jackson.annotation.JsonProperty("author_avatar_url")
    private String authorAvatarUrl;
    private int likesCount;
    private int commentsCount;
    private Boolean isLiked;
    private Boolean isBookmarked;
}