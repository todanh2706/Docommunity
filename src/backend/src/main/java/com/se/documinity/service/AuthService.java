package com.se.documinity.service;

import com.se.documinity.dto.auth.LoginRequest;
import com.se.documinity.dto.auth.LoginResponse;
import com.se.documinity.dto.auth.RegisterRequest;
import com.se.documinity.dto.auth.RegisterResponse;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.exception.UserAlreadyExistsException;
import com.se.documinity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    public RegisterResponse register(RegisterRequest request) {
        // 1. Check for existing username
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            // In a real app, you might want a custom exception here to return 400
            throw new UserAlreadyExistsException("Username already taken");
        }

        // 2. Create UserEntity and map fields
        UserEntity user = new UserEntity();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Set defaults
        user.setStatus(true);
        user.setBio(""); // Empty bio since it's not in the register request

        // 3. Save
        userRepository.save(user);

        // 4. Return response matching the docs: { "message": "Account created" }
        return new RegisterResponse("Account created");
    }

    public LoginResponse login(LoginRequest request) {
        // 1. Authenticate the user (Checks username & password)
        // If this fails, it throws an AuthenticationException automatically
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. Load the UserDetails (needed for token generation)
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // 3. Generate tokens
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // 4. Return response
        return new LoginResponse(accessToken, refreshToken);
    }
}