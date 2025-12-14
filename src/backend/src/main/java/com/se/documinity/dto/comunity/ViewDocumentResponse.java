package com.se.documinity.dto.comunity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViewDocumentResponse {
    private String id;
    private String title;
    private String content;

    private PublicDocumentOwnerResponse owner;
    private int likesCount;
    private int commentsCount;
    private String createdDate;
    private Boolean isLiked;
    private java.util.List<String> tags;
}
