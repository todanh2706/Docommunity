package com.se.documinity.controller;

import com.se.documinity.dto.auth.ForgotPasswordRequest;
import com.se.documinity.dto.auth.LoginRequest;
import com.se.documinity.dto.auth.LogoutRequest;
import com.se.documinity.dto.auth.LogoutResponse;
import com.se.documinity.dto.auth.RefreshRequest;
import com.se.documinity.dto.auth.RegisterRequest;
import com.se.documinity.dto.auth.RegisterResponse;
import com.se.documinity.dto.auth.ResetPasswordRequest;
import com.se.documinity.dto.auth.VerifyAccountRequest;
import com.se.documinity.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.se.documinity.dto.ResponseDTO;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ResponseDTO> register(@Valid @RequestBody RegisterRequest request) {
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(authService.register(request));
        responseDTO.setMessage("success");
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO);
    }

    @PostMapping("/verify-account")
    public ResponseEntity<String> verifyAccount(@RequestBody VerifyAccountRequest request) {
        authService.verifyAccount(request);
        return ResponseEntity.ok("Account verified successfully");
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ResponseDTO> resendVerification(
            @Valid @RequestBody com.se.documinity.dto.auth.ResendVerificationRequest request) {
        authService.resendVerification(request.getEmail());
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setMessage("success");
        responseDTO.setDetail("Verification code resent successfully");
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> login(@Valid @RequestBody LoginRequest request) {
        ResponseDTO responseDTO = new ResponseDTO();
        responseDTO.setData(authService.login(request));
        responseDTO.setMessage("success");
        return ResponseEntity.ok(responseDTO);
    }

    @PostMapping("/logout")
    public ResponseEntity<ResponseDTO> logout(@Valid @RequestBody LogoutRequest request) {
        try {
            authService.logout(request);
            ResponseDTO responseDTO = new ResponseDTO();
            responseDTO.setData(new LogoutResponse("Logged out"));
            responseDTO.setMessage("success");
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            ResponseDTO responseDTO = new ResponseDTO();
            responseDTO.setData(new LogoutResponse("Unauthorized or invalid token"));
            responseDTO.setMessage("error");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseDTO);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ResponseDTO> refresh(@RequestBody RefreshRequest request) {
        try {
            ResponseDTO responseDTO = new ResponseDTO();
            responseDTO.setData(authService.refreshToken(request));
            responseDTO.setMessage("success");
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            ResponseDTO responseDTO = new ResponseDTO();
            responseDTO.setData(Map.of("error", "Invalid or expired refresh token"));
            responseDTO.setMessage("error");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(responseDTO);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ResponseDTO> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);

        ResponseDTO res = new ResponseDTO();
        res.setMessage("success");
        res.setDetail("Reset password link has been sent to your email");
        res.setData(null);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ResponseDTO> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);

        ResponseDTO res = new ResponseDTO();
        res.setMessage("success");
        res.setDetail("Password has been reset successfully");
        res.setData(null);

        return ResponseEntity.status(HttpStatus.OK).body(res);
    }
}