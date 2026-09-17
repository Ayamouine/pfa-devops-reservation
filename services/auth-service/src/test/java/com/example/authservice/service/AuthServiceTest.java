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
import com.example.authservice.repository.PasswordResetTokenRepository;
import com.example.authservice.repository.RefreshTokenRepository;
import com.example.authservice.repository.VerificationTokenRepository;

class AuthServiceTest {

    private AppUserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private RefreshTokenRepository refreshTokenRepository;
    private VerificationTokenRepository verificationTokenRepository;
    private PasswordResetTokenRepository passwordResetTokenRepository;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(AppUserRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
        refreshTokenRepository = mock(RefreshTokenRepository.class);
        verificationTokenRepository = mock(VerificationTokenRepository.class);
        passwordResetTokenRepository = mock(PasswordResetTokenRepository.class);
        authService = new AuthService(
                userRepository,
                passwordEncoder,
                refreshTokenRepository,
                verificationTokenRepository,
                passwordResetTokenRepository,
                "test-secret-key-for-unit-tests-only",
                "test-admin-code",
                "test-prof-code",
                "test-chef-code",
                "test-doyen-code");
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

    @Test
    void register_createsEtudiant_withoutCode() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("etudiant1");
        request.setPassword("secret123");
        request.setRole("ETUDIANT");

        when(userRepository.existsByUsername("etudiant1")).thenReturn(false);
        when(userRepository.save(org.mockito.ArgumentMatchers.any(AppUser.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.register(request);

        assertThat(response.getRole()).isEqualTo("ETUDIANT");
    }

    @Test
    void register_createsProf_whenProfCodeIsCorrect() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("prof1");
        request.setPassword("secret123");
        request.setRole("PROF");
        request.setAdminCode("test-prof-code");
        request.setFirstName("Karim");
        request.setLastName("Bennani");
        request.setFiliere("IDSD");

        when(userRepository.existsByUsername("prof1")).thenReturn(false);
        when(userRepository.save(org.mockito.ArgumentMatchers.any(AppUser.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.register(request);

        assertThat(response.getRole()).isEqualTo("PROF");
        assertThat(response.getFirstName()).isEqualTo("Karim");
        assertThat(response.getFiliere()).isEqualTo("IDSD");
    }

    @Test
    void register_throwsForbidden_whenProfCodeIsWrong() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("prof1");
        request.setPassword("secret123");
        request.setRole("PROF");
        request.setAdminCode("wrong-code");

        when(userRepository.existsByUsername("prof1")).thenReturn(false);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Code professeur invalide");
    }

    @Test
    void register_createsChefFiliere_whenChefCodeIsCorrectAndFiliereProvided() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("chef1");
        request.setPassword("secret123");
        request.setRole("CHEF_FILIERE");
        request.setAdminCode("test-chef-code");
        request.setFiliere("GI");

        when(userRepository.existsByUsername("chef1")).thenReturn(false);
        when(userRepository.save(org.mockito.ArgumentMatchers.any(AppUser.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.register(request);

        assertThat(response.getRole()).isEqualTo("CHEF_FILIERE");
        assertThat(response.getFiliere()).isEqualTo("GI");
    }

    @Test
    void register_throwsBadRequest_whenChefCodeGivenButNoFiliere() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("chef1");
        request.setPassword("secret123");
        request.setRole("CHEF_FILIERE");
        request.setAdminCode("test-chef-code");

        when(userRepository.existsByUsername("chef1")).thenReturn(false);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("La filière est requise");
    }

    @Test
    void register_createsDoyen_whenDoyenCodeIsCorrect() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("doyen1");
        request.setPassword("secret123");
        request.setRole("DOYEN");
        request.setAdminCode("test-doyen-code");

        when(userRepository.existsByUsername("doyen1")).thenReturn(false);
        when(userRepository.save(org.mockito.ArgumentMatchers.any(AppUser.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.register(request);

        assertThat(response.getRole()).isEqualTo("DOYEN");
    }

    @Test
    void register_throwsForbidden_whenDoyenCodeIsWrong() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("doyen1");
        request.setPassword("secret123");
        request.setRole("DOYEN");
        request.setAdminCode("nope");

        when(userRepository.existsByUsername("doyen1")).thenReturn(false);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Code doyen invalide");
    }

    @Test
    void createUser_createsAccount_withoutRegistrationCode() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("nouveau.prof");
        request.setPassword("secret123");
        request.setRole("PROF");
        request.setFirstName("Salma");
        request.setLastName("El Idrissi");
        request.setFiliere("Informatique");

        when(userRepository.existsByUsername("nouveau.prof")).thenReturn(false);
        when(userRepository.save(org.mockito.ArgumentMatchers.any(AppUser.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var dto = authService.createUser(request);

        assertThat(dto.getUsername()).isEqualTo("nouveau.prof");
        assertThat(dto.getRole()).isEqualTo("PROF");
        assertThat(dto.getFirstName()).isEqualTo("Salma");
        assertThat(dto.getFiliere()).isEqualTo("Informatique");
    }

    @Test
    void createUser_throwsConflict_whenUsernameAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("aya");
        request.setPassword("secret123");

        when(userRepository.existsByUsername("aya")).thenReturn(true);

        assertThatThrownBy(() -> authService.createUser(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("existe déjà");
    }

    @Test
    void createUser_throwsBadRequest_whenChefWithoutFiliere() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("chef2");
        request.setPassword("secret123");
        request.setRole("CHEF_FILIERE");

        when(userRepository.existsByUsername("chef2")).thenReturn(false);

        assertThatThrownBy(() -> authService.createUser(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("La filière est requise");
    }

    @Test
    void createUser_throwsBadRequest_whenInvalidRole() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("weird");
        request.setPassword("secret123");
        request.setRole("SUPERUSER");

        when(userRepository.existsByUsername("weird")).thenReturn(false);

        assertThatThrownBy(() -> authService.createUser(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Role invalide");
    }
}