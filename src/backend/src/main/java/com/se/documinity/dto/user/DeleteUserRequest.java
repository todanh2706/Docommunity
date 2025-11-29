package com.se.documinity.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DeleteUserRequest {
    @NotBlank(message = "Password is required to confirm deletion")
    private String password;
}
