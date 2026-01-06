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
import com.se.documinity.entity.VerificationTokenEntity;
import com.se.documinity.exception.UserAlreadyExistsException;
import com.se.documinity.repository.PasswordResetTokenRepository;
import com.se.documinity.repository.UserRepository;
import com.se.documinity.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.se.documinity.dto.auth.ForgotPasswordRequest;
import com.se.documinity.dto.auth.VerifyAccountRequest;
import java.util.UUID;
import java.util.Random;
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
    private final VerificationTokenRepository verificationTokenRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public RegisterResponse register(RegisterRequest request) {
        // 1. Check for existing username
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("Username already taken");
        }

        // Check for existing email
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("Email already taken");
        }

        // 2. Create UserEntity and map fields
        UserEntity user = new UserEntity();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullname(request.getFullname());
        user.setPhoneNumber(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Set defaults
        user.setStatus(true);
        user.setIsVerified(false); // Default to false
        user.setBio("");

        // 3. Save
        userRepository.save(user);

        // 4. Generate Verification OTP
        String otp = generateOTP();
        VerificationTokenEntity verificationToken = new VerificationTokenEntity();
        verificationToken.setToken(otp); // Store OTP in token field
        verificationToken.setUser(user);
        verificationToken.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES)); // 10 minutes expiry
        verificationTokenRepository.save(verificationToken);

        // 5. Send Verification Email
        String subject = "Verify your Documinity account";
        String body = """
                Xin chào %s,

                Cảm ơn bạn đã đăng ký tài khoản tại Documinity.

                Mã xác thực (OTP) của bạn là: %s

                Mã này sẽ hết hạn sau 10 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.

                Trân trọng,
                Documinity Team
                """.formatted(user.getFullname(), otp);

        try {
            emailService.sendSimpleMessage(user.getEmail(), subject, body);
        } catch (Exception e) {
            // Log the error and the token so the user can verify manually in dev
            // environment
            System.err.println("Failed to send verification email: " + e.getMessage());
            System.out.println("VERIFICATION OTP: " + otp);
        }

        // 6. Return response
        return new RegisterResponse("Account created. Please check your email for the verification code.");
    }

    public LoginResponse login(LoginRequest request) {
        // 1. Check if user exists first to provide specific error
        var userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty()) {
            throw new com.se.documinity.exception.UserNotFoundException("User not found");
        }
        UserEntity user = userOpt.get();

        // Check if account is deleted/inactive
        if (Boolean.FALSE.equals(user.getStatus())) {
            throw new RuntimeException("Account has been deactivated or deleted.");
        }

        // Check if verified
        if (Boolean.FALSE.equals(user.getIsVerified())) {
            throw new RuntimeException("Account not verified. Please check your email.");
        }

        // 2. Authenticate the user (Checks password)
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));
        } catch (org.springframework.security.core.AuthenticationException e) {
            // If authentication fails but user exists, it must be the password
            throw new org.springframework.security.authentication.BadCredentialsException("Incorrect password");
        }

        // 3. Load the UserDetails (needed for token generation)
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

        // 4. Generate tokens
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // 5. Return response
        return new LoginResponse(accessToken, refreshToken);
    }

    public void verifyAccount(VerifyAccountRequest request) {
        VerificationTokenEntity verificationToken = verificationTokenRepository
                .findByTokenAndUser_Email(request.getOtp(), request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid OTP or Email"));

        if (verificationToken.getConfirmedAt() != null) {
            throw new RuntimeException("Account already verified");
        }

        if (verificationToken.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("OTP expired");
        }

        UserEntity user = verificationToken.getUser();
        user.setIsVerified(true);
        userRepository.save(user);

        verificationToken.setConfirmedAt(Instant.now());
        verificationTokenRepository.save(verificationToken);
    }

    public void resendVerification(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getIsVerified())) {
            throw new RuntimeException("Account already verified");
        }

        // Generate new OTP
        String otp = generateOTP();

        // Check if token exists, update it or create new
        // Note: Currently we don't have a direct link from user to token in Entity
        // (OneToMany?)
        // or we just find by user? VerificationTokenEntity has User.
        // Let's create a new token for simplicity as multiple tokens are fine,
        // OR better: expire old ones?
        // For now, just save a new one.
        VerificationTokenEntity verificationToken = new VerificationTokenEntity();
        verificationToken.setToken(otp);
        verificationToken.setUser(user);
        verificationToken.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        verificationTokenRepository.save(verificationToken);

        // Send Email
        String subject = "Resend: Verify your Documinity account";
        String body = """
                Xin chào %s,

                Đây là mã xác thực (OTP) mới của bạn: %s

                Mã này sẽ hết hạn sau 10 phút.

                Trân trọng,
                Documinity Team
                """.formatted(user.getFullname(), otp);

        try {
            emailService.sendSimpleMessage(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to resend verification email: " + e.getMessage());
            System.out.println("RESEND VERIFICATION OTP: " + otp);
        }
    }

    public void logout(LogoutRequest request) {
        String token = request.getRefreshToken();
        // 1. Check if the token is valid (format and expiration)
        try {
            String username = jwtService.extractUsername(token);
            // TODO: In a production app, revoke token logic
        } catch (Exception e) {
            throw new RuntimeException("Unauthorized or invalid token");
        }
    }

    public RefreshResponse refreshToken(RefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        String username;

        // 1. Try to extract username
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