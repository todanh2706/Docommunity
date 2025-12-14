package com.se.documinity.dto.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentResponse {
    private Long id;
    private String title;
    private String content;
    private LocalDate createdDate;
    private LocalDate lastModified;
    private Boolean isPublic;
    private List<String> tags;
    private String authorName;
    private Long authorId;
    private int likesCount;
    private int commentsCount;
    private Boolean isLiked;
    private Boolean isBookmarked;
}