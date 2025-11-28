package com.se.documinity.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must have at least 6 characters")
    private String password;

    @NotBlank(message = "Display name (fullname) is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Not a valid email address")
    private String email;

    // Optional according to your docs
    private String phone;
}