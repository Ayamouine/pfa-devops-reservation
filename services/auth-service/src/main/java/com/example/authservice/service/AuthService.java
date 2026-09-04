package com.example.authservice.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.authservice.entity.AppUser;
import com.example.authservice.model.AuthRequest;
import com.example.authservice.model.AuthResponse;
import com.example.authservice.model.RegisterRequest;
import com.example.authservice.repository.AppUserRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class AuthService {

    private final String secret;
    private final String adminRegistrationCode;
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AppUserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        @Value("${jwt.secret}") String secret,
                        @Value("${admin.registration.code}") String adminRegistrationCode) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.secret = secret;
        this.adminRegistrationCode = adminRegistrationCode;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        String requestedRole = request.getRole() == null || request.getRole().isBlank() ? "USER" : request.getRole();

        String finalRole;
        if ("ADMIN".equalsIgnoreCase(requestedRole)) {
            if (request.getAdminCode() == null || !adminRegistrationCode.equals(request.getAdminCode())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Code administrateur invalide");
            }
            finalRole = "ADMIN";
        } else {
            finalRole = "USER";
        }

        AppUser user = new AppUser(request.getUsername(), passwordEncoder.encode(request.getPassword()), finalRole);
        AppUser savedUser = userRepository.save(user);
        return new AuthResponse(generateToken(savedUser), savedUser.getUsername(), savedUser.getRole());
    }

    public AuthResponse login(AuthRequest request) {
        AppUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return new AuthResponse(generateToken(user), user.getUsername(), user.getRole());
    }

    private String generateToken(AppUser user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }
}