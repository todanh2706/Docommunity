package com.se.documinity.service;

import com.se.documinity.dto.user.*;
import com.se.documinity.dto.comunity.PublicDocumentResponse;
import com.se.documinity.dto.comunity.PublicDocumentOwnerResponse;
import com.se.documinity.entity.DocumentEntity;
import com.se.documinity.entity.TagEntity;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.repository.DocumentRepository;
import com.se.documinity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new UserResponse(
                user.getId(),
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
                updatedUser.getId(),
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

        // Count public documents owned by this user
        List<DocumentEntity> userDocs = documentRepository.findByUserIdAndIsPublicTrue(user.getId());
        int docsCount = userDocs != null ? userDocs.size() : 0;

        // Count total likes received on user's public documents
        int totalLikes = 0;
        if (userDocs != null) {
            for (DocumentEntity doc : userDocs) {
                totalLikes += doc.getLikedByUsers() != null ? doc.getLikedByUsers().size() : 0;
            }
        }

        // Activity stats - count comments made by this user
        int commentsCount = user.getComments() != null ? user.getComments().size() : 0;

        // Activity stats - count likes given by this user
        int likesGivenCount = user.getLikedDocuments() != null ? user.getLikedDocuments().size() : 0;

        // Convert user's public documents to PublicDocumentResponse
        List<PublicDocumentResponse> documents = null;
        if (userDocs != null && !userDocs.isEmpty()) {
            documents = userDocs.stream().map(doc -> PublicDocumentResponse.builder()
                    .id(doc.getId())
                    .title(doc.getTitle())
                    .snipetContent(buildSnippet(doc.getContent()))
                    .owner(PublicDocumentOwnerResponse.builder()
                            .id(user.getId())
                            .name(user.getFullname() != null ? user.getFullname() : user.getUsername())
                            .avatarUrl(user.getAvatarUrl())
                            .build())
                    .lastModified(doc.getLastModified() != null ? doc.getLastModified() : doc.getCreatedDate())
                    .likesCount(doc.getLikedByUsers() != null ? doc.getLikedByUsers().size() : 0)
                    .commentsCount(doc.getComments() != null ? doc.getComments().size() : 0)
                    .isLiked(false)
                    .isBookmarked(false)
                    .tags(doc.getTags().stream().map(TagEntity::getName).collect(Collectors.toList()))
                    .build()).collect(Collectors.toList());
        }

        return PublicUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullname(user.getFullname() != null ? user.getFullname() : user.getUsername())
                .bio(user.getBio())
                .avatar_url(user.getAvatarUrl())
                .documentsCount(docsCount)
                .likesCount(totalLikes)
                .createdAt("Member")
                .commentsCount(commentsCount)
                .likesGivenCount(likesGivenCount)
                .documents(documents)
                .build();
    }

    private String buildSnippet(String content) {
        if (content == null)
            return "";
        int max = 150;
        if (content.length() <= max)
            return content;
        return content.substring(0, max) + "...";
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
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getFullname(),
                        user.getPhoneNumber(),
                        user.getBio(),
                        user.getAvatarUrl()))
                .collect(java.util.stream.Collectors.toList());
    }
}