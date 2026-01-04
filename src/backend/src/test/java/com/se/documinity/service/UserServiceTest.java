package com.se.documinity.service;

import com.se.documinity.dto.user.UpdateUserRequest;
import com.se.documinity.dto.user.UserResponse;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    public void setUp() {
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    public void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    public void testGetCurrentUser() {
        String username = "testuser";
        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setEmail("test@example.com");
        user.setFullname("Test User");

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(username);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        UserResponse response = userService.getCurrentUser();

        assertNotNull(response);
        assertEquals(username, response.getUsername());
        assertEquals("test@example.com", response.getEmail());
    }

    @Test
    public void testUpdateUser() {
        String username = "testuser";
        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setFullname("Old Name");

        UpdateUserRequest request = new UpdateUserRequest("new@email.com", "0987654321", "New Name", "New Bio");

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(username);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateUser(request);

        assertEquals("New Name", response.getFullName());
        verify(userRepository).save(user);
    }
}
