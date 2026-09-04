package com.example.authservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.example.authservice.entity.AppUser;
import com.example.authservice.model.AuthRequest;
import com.example.authservice.model.AuthResponse;
import com.example.authservice.model.RegisterRequest;
import com.example.authservice.repository.AppUserRepository;

class AuthServiceTest {

    private AppUserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(AppUserRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepository, passwordEncoder, "test-secret-key-for-unit-tests-only", "test-admin-code");
    }

    @Test
    void register_createsNewUser_whenUsernameNotTaken() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("aya");
        request.setPassword("secret123");
        request.setRole("USER");

        when(userRepository.existsByUsername("aya")).thenReturn(false);
        when(userRepository.save(org.mockito.ArgumentMatchers.any(AppUser.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.register(request);

        assertThat(response.getUsername()).isEqualTo("aya");
        assertThat(response.getRole()).isEqualTo("USER");
        assertThat(response.getToken()).isNotBlank();
    }

    @Test
    void register_throwsConflict_whenUsernameAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("aya");
        request.setPassword("secret123");

        when(userRepository.existsByUsername("aya")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void register_createsAdmin_whenAdminCodeIsCorrect() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("boss");
        request.setPassword("secret123");
        request.setRole("ADMIN");
        request.setAdminCode("test-admin-code");

        when(userRepository.existsByUsername("boss")).thenReturn(false);
        when(userRepository.save(org.mockito.ArgumentMatchers.any(AppUser.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.register(request);

        assertThat(response.getRole()).isEqualTo("ADMIN");
    }

    @Test
    void register_throwsForbidden_whenAdminCodeIsWrong() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("boss");
        request.setPassword("secret123");
        request.setRole("ADMIN");
        request.setAdminCode("wrong-code");

        when(userRepository.existsByUsername("boss")).thenReturn(false);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Code administrateur invalide");
    }

    @Test
    void login_succeeds_whenCredentialsAreCorrect() {
        String rawPassword = "secret123";
        AppUser storedUser = new AppUser("aya", passwordEncoder.encode(rawPassword), "USER");

        AuthRequest request = new AuthRequest();
        request.setUsername("aya");
        request.setPassword(rawPassword);

        when(userRepository.findByUsername("aya")).thenReturn(Optional.of(storedUser));

        AuthResponse response = authService.login(request);

        assertThat(response.getUsername()).isEqualTo("aya");
        assertThat(response.getToken()).isNotBlank();
    }

    @Test
    void login_throwsUnauthorized_whenPasswordIsWrong() {
        AppUser storedUser = new AppUser("aya", passwordEncoder.encode("correctPassword"), "USER");

        AuthRequest request = new AuthRequest();
        request.setUsername("aya");
        request.setPassword("wrongPassword");

        when(userRepository.findByUsername("aya")).thenReturn(Optional.of(storedUser));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void login_throwsUnauthorized_whenUserDoesNotExist() {
        AuthRequest request = new AuthRequest();
        request.setUsername("ghost");
        request.setPassword("whatever");

        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Invalid credentials");
    }
}