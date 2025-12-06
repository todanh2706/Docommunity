package com.se.documinity.service;

import com.se.documinity.dto.auth.LoginRequest;
import com.se.documinity.dto.auth.LoginResponse;
import com.se.documinity.dto.auth.LogoutRequest;
import com.se.documinity.dto.auth.RefreshRequest;
import com.se.documinity.dto.auth.RefreshResponse;
import com.se.documinity.dto.auth.RegisterRequest;
import com.se.documinity.dto.auth.RegisterResponse;
import com.se.documinity.dto.auth.ResetPasswordRequest;
import com.se.documinity.entity.PasswordResetTokenEntity;
import com.se.documinity.entity.UserEntity;
import com.se.documinity.exception.UserAlreadyExistsException;
import com.se.documinity.repository.PasswordResetTokenRepository;
import com.se.documinity.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.se.documinity.dto.auth.ChangePasswordRequest;
import com.se.documinity.dto.auth.ForgotPasswordRequest;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

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
        user.setFullname(request.getFullname());
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

    public void logout(LogoutRequest request) {
        String token = request.getRefreshToken();

        // 1. Check if the token is valid (format and expiration)
        try {
            String username = jwtService.extractUsername(token);
            
            // TODO: In a production app, this is where you would:
            // 1. Check if the token exists in a "refresh_tokens" database table.
            // 2. Delete it or set a 'revoked' flag to true.
            
        } catch (Exception e) {
            throw new RuntimeException("Unauthorized or invalid token"); 
        }
    }

    public RefreshResponse refreshToken(RefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        String username;

        // 1. Try to extract username (this will throw an exception if token is invalid/expired)
        try {
            username = jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new RuntimeException("Invalid refresh token"); 
        }

        // 2. Load the user details
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        // 3. Validate the token fully (check expiry and signature)
        if (jwtService.validateToken(refreshToken, userDetails)) {
            
            // 4. Generate a NEW access token
            String newAccessToken = jwtService.generateToken(userDetails);
            
            return new RefreshResponse(newAccessToken);
        } else {
            throw new RuntimeException("Invalid refresh token");
        }
    }


    public void forgotPassword(ForgotPasswordRequest request) {
        // 1. Find user by email
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User with given email not found"));

        // 2. Generate random token
        String token = UUID.randomUUID().toString();

        // 3. Create token entity (ví dụ: hết hạn sau 30 phút)
        PasswordResetTokenEntity resetToken = new PasswordResetTokenEntity();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
        resetToken.setUsed(false);

        passwordResetTokenRepository.save(resetToken);

        // 4. Build reset link cho FE
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        // 5. Gửi email
        String subject = "Reset your Documinity password";
        String body = """
                Xin chào %s,

                Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Documinity của mình.

                Vui lòng click vào link sau để đặt lại mật khẩu (hết hạn sau 30 phút):
                %s

                Nếu bạn không yêu cầu, hãy bỏ qua email này.

                Trân trọng,
                Documinity Team
                """.formatted(user.getFullname(), resetLink);

        emailService.sendSimpleMessage(user.getEmail(), subject, body);
    }

    public void resetPassword(ResetPasswordRequest request) {
        String token = request.getToken();

        PasswordResetTokenEntity resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        // 1. Check used
        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new RuntimeException("Reset token already used");
        }

        // 2. Check expired
        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Reset token expired");
        }

        // 3. Update user password
        UserEntity user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // 4. Mark token used (hoặc delete luôn cũng được)
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }
}