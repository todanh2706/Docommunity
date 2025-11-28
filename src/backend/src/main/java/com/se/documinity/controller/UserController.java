package com.se.documinity.controller;

import com.se.documinity.dto.user.DeleteUserRequest;
import com.se.documinity.dto.user.UpdateUserRequest;
import com.se.documinity.dto.user.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/users")
public class UserController {
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok().body(new UserResponse());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(UpdateUserRequest request) {
        return ResponseEntity.ok().body(new UserResponse());
    }

    @DeleteMapping("/me")
    public ResponseEntity<UserResponse> deleteCurrentUser(DeleteUserRequest request) {
        return ResponseEntity.ok().body(new UserResponse());
    }
}
