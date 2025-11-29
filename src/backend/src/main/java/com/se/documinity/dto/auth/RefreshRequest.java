package com.se.documinity.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RefreshRequest {
    @NotBlank(message = "Missing refresh token")
    private String refreshToken;
}
