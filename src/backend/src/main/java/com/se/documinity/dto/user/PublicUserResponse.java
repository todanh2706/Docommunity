package com.se.documinity.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PublicUserResponse {
    private Long id;
    private String username;
    private String fullname;
    private String bio;
}
