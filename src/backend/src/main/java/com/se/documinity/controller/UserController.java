package com.se.documinity.controller;

import com.se.documinity.dto.user.*;
import com.se.documinity.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentProfile() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateUser(@Valid @RequestBody UpdateUserRequest updateRequest) {
        UserResponse updatedUser = userService.updateUser(updateRequest);
        return ResponseEntity.ok(updatedUser); 
    }

    @DeleteMapping("/me")
    public ResponseEntity<UserResponse> deleteUser(@Valid @RequestBody UpdateUserRequest updateRequest) {
        UserResponse updatedUser = userService.updateUser(updateRequest);
        return ResponseEntity.ok(updatedUser); 
    }

    public ResponseEntity<?> deleteAccount(@Valid @RequestBody DeleteUserRequest request) {
        try {
            userService.deleteAccount(request);
            
            return ResponseEntity.ok(Map.of(
                "message", "Account deactivated successfully."
            ));
            
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Incorrect password")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Incorrect password"));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}