package com.se.documinity.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;

    private String username;

    private String email;

    @JsonProperty("fullname")
    private String fullName;

    private String phone;

    private String bio;
    @JsonProperty("avatar_url")
    private String avatarUrl;
    
    @JsonProperty("is_private")
    private Boolean isPrivate;

    @JsonProperty("followers_count")
    private Integer followersCount;

    @JsonProperty("is_following")
    private Boolean isFollowing;
}