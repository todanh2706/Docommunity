package com.se.documinity.dto.user;

import java.util.List;
import com.se.documinity.dto.comunity.PublicDocumentResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PublicUserResponse {
    private Long id;
    private String username;
    private String fullname;
    private String bio;
    private String avatar_url;
    private int documentsCount;
    private int likesCount; // Total likes received on user's documents
    private String createdAt;

    // Activity stats
    private int commentsCount; // Number of comments user made
    private int likesGivenCount; // Number of likes user gave

    // User's public documents
    private List<PublicDocumentResponse> documents;
}
