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
import org.springframework.transaction.annotation.Transactional;

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
                user.getAvatarUrl(),
                user.getIsPrivate(),
                user.getFollowers() != null ? user.getFollowers().size() : 0,
                false);
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
                updatedUser.getAvatarUrl(),
                updatedUser.getIsPrivate(),
                updatedUser.getFollowers() != null ? updatedUser.getFollowers().size() : 0,
                false);
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

    @Transactional(readOnly = true)
    public PublicUserResponse getPublicUserProfile(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get current user to check follow status and own profile
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity currentUser = null;
        boolean isFollowing = false;
        boolean isOwnProfile = false;
        
        if (currentUsername != null && !currentUsername.equals("anonymousUser")) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
            if (currentUser != null) {
                isOwnProfile = currentUser.getId().equals(user.getId());
                // Use direct query to avoid lazy loading issues
                isFollowing = userRepository.isFollowing(currentUser.getId(), user.getId());
            }
        }

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

        // Follow counts
        int followersCount = user.getFollowers() != null ? user.getFollowers().size() : 0;
        int followingCount = user.getFollowing() != null ? user.getFollowing().size() : 0;

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
                .followersCount(followersCount)
                .followingCount(followingCount)
                .isFollowing(isFollowing)
                .isOwnProfile(isOwnProfile)
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

        // Get current username to exclude from list
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Get current user for checking follow status
        UserEntity currentUser = null;
        if (currentUsername != null && !currentUsername.equals("anonymousUser")) {
            currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        }
        final UserEntity finalCurrentUser = currentUser;

        if (search != null && !search.isBlank()) {
            users = userRepository.findByUsernameContainingIgnoreCaseOrFullnameContainingIgnoreCase(search, search);
        } else {
            users = userRepository.findAll();
        }

        // Filter out private users and current user
        return users.stream()
                .filter(user -> !Boolean.TRUE.equals(user.getIsPrivate()))
                .filter(user -> !user.getUsername().equals(currentUsername))
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getFullname(),
                        user.getPhoneNumber(),
                        user.getBio(),
                        user.getAvatarUrl(),
                        user.getIsPrivate(),
                        user.getFollowers() != null ? user.getFollowers().size() : 0,
                        finalCurrentUser != null && finalCurrentUser.getFollowing() != null && finalCurrentUser.getFollowing().contains(user)))
                .collect(java.util.stream.Collectors.toList());
    }

    public Boolean togglePrivacy() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Toggle privacy
        Boolean newPrivacyState = !Boolean.TRUE.equals(user.getIsPrivate());
        user.setIsPrivate(newPrivacyState);
        userRepository.save(user);

        return newPrivacyState;
    }

    public boolean followUser(Long targetUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserEntity targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        // Prevent self-follow
        if (currentUser.getId().equals(targetUserId)) {
            throw new RuntimeException("Cannot follow yourself");
        }

        // Check if already following
        if (currentUser.getFollowing().contains(targetUser)) {
            // Unfollow
            currentUser.getFollowing().remove(targetUser);
            userRepository.save(currentUser);
            return false;
        } else {
            // Follow
            currentUser.getFollowing().add(targetUser);
            userRepository.save(currentUser);
            return true;
        }
    }

    public boolean isFollowing(Long targetUserId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        if (currentUsername == null || currentUsername.equals("anonymousUser")) {
            return false;
        }

        UserEntity currentUser = userRepository.findByUsername(currentUsername)
                .orElse(null);

        if (currentUser == null) {
            return false;
        }

        UserEntity targetUser = userRepository.findById(targetUserId).orElse(null);

        return targetUser != null && currentUser.getFollowing().contains(targetUser);
    }

    public int getFollowersCount(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getFollowers() != null ? user.getFollowers().size() : 0;
    }

    public int getFollowingCount(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getFollowing() != null ? user.getFollowing().size() : 0;
    }
}