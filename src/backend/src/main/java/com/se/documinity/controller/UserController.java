package com.se.documinity.controller;

import com.se.documinity.dto.user.*;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.exception.UserNotFoundException;
import com.se.documinity.repository.UserRepository;
import com.se.documinity.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.se.documinity.service.FileStorageService;

import org.springframework.web.bind.annotation.PathVariable;
import com.se.documinity.dto.ResponseDTO;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @GetMapping("/me")
    public ResponseEntity<ResponseDTO> getCurrentProfile() {
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(userService.getCurrentUser());
        responseDTO.setMessage("success");
        responseDTO.setDetail("Current user profile retrieved successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDTO> getPublicUserProfile(@PathVariable Long id) {
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(userService.getPublicUserProfile(id));
        responseDTO.setMessage("success");
        responseDTO.setDetail("Public user profile retrieved successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @PutMapping("/me")
    public ResponseEntity<ResponseDTO> updateUser(@Valid @RequestBody UpdateUserRequest updateRequest) {
        UserResponse updatedUser = userService.updateUser(updateRequest);

        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(updatedUser);
        responseDTO.setMessage("success");
        responseDTO.setDetail("User updated successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/me")
    public ResponseEntity<ResponseDTO> deleteUser(@Valid @RequestBody UpdateUserRequest updateRequest) {
        UserResponse updatedUser = userService.updateUser(updateRequest);

        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(updatedUser);
        responseDTO.setMessage("success");
        responseDTO.setDetail("User deleted successfully");
        return ResponseEntity.ok(responseDTO);

    }

    public ResponseEntity<ResponseDTO> deleteAccount(@Valid @RequestBody DeleteUserRequest request) {
        try {
            userService.deleteAccount(request);
            ResponseDTO responseDTO = new ResponseDTO();
            responseDTO.setMessage("success");
            responseDTO.setDetail("Account deleted successfully");
            return ResponseEntity.ok(responseDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().equals("Incorrect password")) {
                ResponseDTO responseDTO = new ResponseDTO();
                responseDTO.setMessage("error");
                responseDTO.setDetail("Incorrect password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseDTO);
            }
            ResponseDTO responseDTO = new ResponseDTO();
            responseDTO.setMessage("error");
            responseDTO.setDetail("An error occurred while deleting the account");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseDTO);
        }
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<ResponseDTO> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        String avatarUrl = fileStorageService.saveAvatar(file, user.getId());
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        ResponseDTO res = new ResponseDTO();
        res.setMessage("success");
        res.setDetail("Avatar updated successfully");
        res.setData(Map.of("avatarUrl", avatarUrl));

        return ResponseEntity.ok(res);
    }
}