package com.se.documinity.dto.note;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class NoteResponse {
    private Long id;

    private String title;

    private LocalDateTime createdDate;

    private boolean isPublic;
}
