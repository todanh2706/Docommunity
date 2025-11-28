package com.se.documinity.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpdateUserRequest {
    private String email;

    private String phone;

    private String fullName;

    private String bio;
}
