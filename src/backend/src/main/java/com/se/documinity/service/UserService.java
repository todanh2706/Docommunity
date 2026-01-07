package com.se.documinity.service;

import com.se.documinity.dto.user.*;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new UserResponse(
                user.getUsername(),
                user.getEmail(),
                user.getFullname(),
                user.getPhoneNumber(),
                user.getBio(),
                user.getAvatarUrl());
    }

    public UserResponse updateUser(UpdateUserRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullname(request.getFullName());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhoneNumber(request.getPhone());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        // 3. Save changes
        UserEntity updatedUser = userRepository.save(user);

        // 4. Return the updated response
        return new UserResponse(
                updatedUser.getUsername(),
                updatedUser.getEmail(),
                updatedUser.getFullname(),
                updatedUser.getPhoneNumber(),
                updatedUser.getBio(),
                updatedUser.getAvatarUrl());
    }

    public void deleteAccount(DeleteUserRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }

        user.setStatus(false);
        userRepository.save(user);
    }

    public PublicUserResponse getPublicUserProfile(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new PublicUserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullname(),
                user.getBio());
    }

    public List<UserResponse> getAllUsers(String search) {
        List<UserEntity> users;

        if (search != null && !search.isBlank()) {
            users = userRepository.findByUsernameContainingIgnoreCaseOrFullnameContainingIgnoreCase(search, search);
        } else {
            users = userRepository.findAll();
        }

        return users.stream()
                .map(user -> new UserResponse(
                        user.getUsername(),
                        user.getEmail(),
                        user.getFullname(),
                        user.getPhoneNumber(),
                        user.getBio(),
                        user.getAvatarUrl()))
                .collect(java.util.stream.Collectors.toList());
    }
}