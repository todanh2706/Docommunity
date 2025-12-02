package com.se.documinity.dto.document;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class CreateDocumentRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String content;

    private Boolean isPublic;

    private List<String> tags;
}