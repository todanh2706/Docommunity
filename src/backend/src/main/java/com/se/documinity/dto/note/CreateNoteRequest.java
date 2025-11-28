package com.se.documinity.dto.note;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CreateNoteRequest {
    private String title;
    private String content;
    private List<String> tags;
    private boolean isPublic;
}
