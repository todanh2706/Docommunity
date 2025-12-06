package com.se.documinity.dto.auth;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;


@Data
public class ResetPasswordRequest {

    @NotBlank
    private String token;

    @NotBlank
    private String newPassword;
}