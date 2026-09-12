package com.example.authservice.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.authservice.model.AuthRequest;
import com.example.authservice.model.AuthResponse;
import com.example.authservice.model.RegisterRequest;
import com.example.authservice.service.AuthService;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002"})
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "auth-service", "status", "up");
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody java.util.Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    @PostMapping("/forgot")
    public ResponseEntity<java.util.Map<String, String>> forgot(@RequestBody java.util.Map<String, String> body) {
        String username = body.get("username");
        String token = authService.createPasswordResetToken(username);
        // In real life, send by email. Here return token for demo.
        return ResponseEntity.ok(java.util.Map.of("resetToken", token));
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> reset(@RequestBody java.util.Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        authService.resetPassword(token, newPassword);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/verify")
    public ResponseEntity<Void> verify(@org.springframework.web.bind.annotation.RequestParam String token) {
        authService.verifyAccount(token);
        return ResponseEntity.noContent().build();
    }
}
