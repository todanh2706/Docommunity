package com.se.documinity.dto.documents;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
public class CreateDocumentRequest {
    private String title;
    private String content;
    @JsonProperty("tags")
    private List<String> tags;

    @JsonProperty("isPublic")
    private boolean isPublic;
}
