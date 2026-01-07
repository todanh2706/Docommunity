package com.se.documinity.dto.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShareLinkResponse {
    private Boolean shareEnabled;
    private String shareToken;
}
