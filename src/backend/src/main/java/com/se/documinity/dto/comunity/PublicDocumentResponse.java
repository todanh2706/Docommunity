package com.se.documinity.dto.comunity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PublicDocumentResponse {
    private Long id;
    private String title;
    private String snipetContent;
    private PublicDocumentOwnerResponse owner;
}
