package com.example.authservice.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.authservice.entity.AppUser;
import com.example.authservice.entity.PasswordResetToken;
import com.example.authservice.entity.RefreshToken;
import com.example.authservice.entity.VerificationToken;
import com.example.authservice.model.AuthRequest;
import com.example.authservice.model.AuthResponse;
import com.example.authservice.model.RegisterRequest;
import com.example.authservice.repository.AppUserRepository;
import com.example.authservice.repository.PasswordResetTokenRepository;
import com.example.authservice.repository.RefreshTokenRepository;
import com.example.authservice.repository.VerificationTokenRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class AuthService {

    private final String secret;
    private final String adminRegistrationCode;
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthService(AppUserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       RefreshTokenRepository refreshTokenRepository,
                       VerificationTokenRepository verificationTokenRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       @Value("${jwt.secret}") String secret,
                       @Value("${admin.registration.code:admin-code}") String adminRegistrationCode) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
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
        String refresh = createRefreshToken(savedUser.getUsername());
        return new AuthResponse(generateToken(savedUser), refresh, savedUser.getUsername(), savedUser.getRole());
    }

    public AuthResponse login(AuthRequest request) {
        AppUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String refresh = createRefreshToken(user.getUsername());
        return new AuthResponse(generateToken(user), refresh, user.getUsername(), user.getRole());
    }

    private String createRefreshToken(String username) {
        refreshTokenRepository.deleteByUsername(username);
        String token = java.util.UUID.randomUUID().toString();
        java.time.Instant expiry = java.time.Instant.now().plus(java.time.Duration.ofDays(7));
        RefreshToken rt = new RefreshToken(token, username, expiry);
        refreshTokenRepository.save(rt);
        return token;
    }

    public AuthResponse refresh(String refreshToken) {
        RefreshToken rt = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));
        if (rt.getExpiryDate().isBefore(java.time.Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }
        AppUser user = userRepository.findByUsername(rt.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        String newJwt = generateToken(user);
        String newRefresh = createRefreshToken(user.getUsername());
        return new AuthResponse(newJwt, newRefresh, user.getUsername(), user.getRole());
    }

    public String createVerificationToken(String username) {
        String token = java.util.UUID.randomUUID().toString();
        java.time.Instant expiry = java.time.Instant.now().plus(java.time.Duration.ofHours(24));
        VerificationToken vt = new VerificationToken(token, username, expiry);
        verificationTokenRepository.save(vt);
        return token;
    }

    public void verifyAccount(String token) {
        VerificationToken vt = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification token"));
        if (vt.getExpiryDate().isBefore(java.time.Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token expired");
        }
        AppUser user = userRepository.findByUsername(vt.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        // nothing to change for now (could set a verified flag)
        verificationTokenRepository.delete(vt);
    }

    public String createPasswordResetToken(String username) {
        if (!userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        String token = java.util.UUID.randomUUID().toString();
        java.time.Instant expiry = java.time.Instant.now().plus(java.time.Duration.ofHours(2));
        PasswordResetToken prt = new PasswordResetToken(token, username, expiry);
        passwordResetTokenRepository.save(prt);
        return token;
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reset token"));
        if (prt.getExpiryDate().isBefore(java.time.Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token expired");
        }
        AppUser user = userRepository.findByUsername(prt.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(prt);
    }
    

    private String generateToken(AppUser user) {
        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }
}