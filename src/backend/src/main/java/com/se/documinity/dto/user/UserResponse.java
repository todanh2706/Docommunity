package com.se.documinity.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String username;
    
    private String email;

    @JsonProperty("fullname") 
    private String fullName;

    private String phone;

    private String bio;
    @JsonProperty("avatar_url")
    private String avatarUrl;
}