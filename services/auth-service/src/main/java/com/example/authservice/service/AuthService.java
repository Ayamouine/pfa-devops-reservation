package com.example.authservice.service;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import com.example.authservice.entity.AppUser;
import com.example.authservice.entity.PasswordResetToken;
import com.example.authservice.entity.RefreshToken;
import com.example.authservice.entity.VerificationToken;
import com.example.authservice.model.AuthRequest;
import com.example.authservice.model.AuthResponse;
import com.example.authservice.model.RegisterRequest;
import com.example.authservice.model.UserDto;
import com.example.authservice.repository.AppUserRepository;
import com.example.authservice.repository.PasswordResetTokenRepository;
import com.example.authservice.repository.RefreshTokenRepository;
import com.example.authservice.repository.VerificationTokenRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class AuthService {

    public static final List<String> VALID_ROLES = List.of(
            "USER", "ADMIN", "ETUDIANT", "PROF", "CHEF_FILIERE", "DOYEN", "CLUB");

    private static final java.util.regex.Pattern INSTITUTIONAL_EMAIL =
            java.util.regex.Pattern.compile("^[\\w.+-]+@uhp\\.ac\\.ma$", java.util.regex.Pattern.CASE_INSENSITIVE);

    private final String secret;
    private final String adminRegistrationCode;
    private final String profRegistrationCode;
    private final String chefRegistrationCode;
    private final String doyenRegistrationCode;
    private final String clubRegistrationCode;
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
                       @Value("${admin.registration.code:admin-code}") String adminRegistrationCode,
                       @Value("${prof.registration.code:pfa-prof-2026}") String profRegistrationCode,
                       @Value("${chef.registration.code:pfa-chef-2026}") String chefRegistrationCode,
                       @Value("${doyen.registration.code:pfa-doyen-2026}") String doyenRegistrationCode,
                       @Value("${club.registration.code:pfa-club-2026}") String clubRegistrationCode) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.secret = secret;
        this.adminRegistrationCode = adminRegistrationCode;
        this.profRegistrationCode = profRegistrationCode;
        this.chefRegistrationCode = chefRegistrationCode;
        this.doyenRegistrationCode = doyenRegistrationCode;
        this.clubRegistrationCode = clubRegistrationCode;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'email institutionnel est requis");
        }
        if (!INSTITUTIONAL_EMAIL.matcher(email).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Email institutionnel invalide (format attendu : prenom.nom.fst@uhp.ac.ma)");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé");
        }

        String requestedRole = request.getRole() == null || request.getRole().isBlank() ? "USER" : request.getRole();
        String finalRole = resolveFinalRole(request, requestedRole);

        AppUser user = new AppUser(request.getUsername(), passwordEncoder.encode(request.getPassword()), finalRole);
        user.setEmail(email);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setFiliere(request.getFiliere());
        user.setClub(request.getClub());
        AppUser savedUser = userRepository.save(user);
        String refresh = createRefreshToken(savedUser.getUsername());
        return toAuthResponse(savedUser, refresh);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    private String resolveFinalRole(RegisterRequest request, String requestedRole) {
        String role = requestedRole.toUpperCase();
        switch (role) {
            case "ADMIN":
                requireCode(request.getAdminCode(), adminRegistrationCode, "Code administrateur invalide");
                return "ADMIN";
            case "DOYEN":
                requireCode(request.getAdminCode(), doyenRegistrationCode, "Code doyen invalide");
                return "DOYEN";
            case "CHEF_FILIERE":
                requireCode(request.getAdminCode(), chefRegistrationCode, "Code chef de filière invalide");
                if (request.getFiliere() == null || request.getFiliere().isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La filière est requise pour le rôle Chef de filière");
                }
                return "CHEF_FILIERE";
            case "PROF":
                requireCode(request.getAdminCode(), profRegistrationCode, "Code professeur invalide");
                return "PROF";
            case "CLUB":
                requireCode(request.getAdminCode(), clubRegistrationCode, "Code club invalide");
                if (request.getClub() == null || request.getClub().isBlank()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le club est requis pour le rôle Club");
                }
                return "CLUB";
            case "ETUDIANT":
                return "ETUDIANT";
            default:
                return "USER";
        }
    }

    private void requireCode(String provided, String expected, String message) {
        if (provided == null || !expected.equals(provided)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, message);
        }
    }

    @Transactional
    public AuthResponse login(AuthRequest request) {
        String email = normalizeEmail(request.getEmail());
        AppUser user = (email != null
                ? userRepository.findByEmail(email)
                : userRepository.findByUsername(request.getUsername()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String refresh = createRefreshToken(user.getUsername());
        return toAuthResponse(user, refresh);
    }

    private String createRefreshToken(String username) {
        refreshTokenRepository.deleteByUsername(username);
        String token = java.util.UUID.randomUUID().toString();
        java.time.Instant expiry = java.time.Instant.now().plus(java.time.Duration.ofDays(7));
        RefreshToken rt = new RefreshToken(token, username, expiry);
        refreshTokenRepository.save(rt);
        return token;
    }

    @Transactional
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
        return toAuthResponse(user, newRefresh);
    }

    public String createVerificationToken(String username) {
        String token = java.util.UUID.randomUUID().toString();
        java.time.Instant expiry = java.time.Instant.now().plus(java.time.Duration.ofHours(24));
        VerificationToken vt = new VerificationToken(token, username, expiry);
        verificationTokenRepository.save(vt);
        return token;
    }

    @Transactional
    public void verifyAccount(String token) {
        VerificationToken vt = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification token"));
        if (vt.getExpiryDate().isBefore(java.time.Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token expired");
        }
        userRepository.findByUsername(vt.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        verificationTokenRepository.delete(vt);
    }

    public String createPasswordResetToken(String identifier) {
        String email = normalizeEmail(identifier);
        AppUser user = (email != null
                ? userRepository.findByEmail(email)
                : userRepository.findByUsername(identifier))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        String token = java.util.UUID.randomUUID().toString();
        java.time.Instant expiry = java.time.Instant.now().plus(java.time.Duration.ofHours(2));
        PasswordResetToken prt = new PasswordResetToken(token, user.getUsername(), expiry);
        passwordResetTokenRepository.save(prt);
        return token;
    }

    @Transactional
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
                .claim("filiere", user.getFiliere() == null ? "" : user.getFiliere())
                .claim("email", user.getEmail() == null ? "" : user.getEmail())
                .claim("club", user.getClub() == null ? "" : user.getClub())
                .claim("firstName", user.getFirstName() == null ? "" : user.getFirstName())
                .claim("lastName", user.getLastName() == null ? "" : user.getLastName())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    private AuthResponse toAuthResponse(AppUser user, String refreshToken) {
        AuthResponse response = new AuthResponse(generateToken(user), refreshToken, user.getUsername(), user.getRole(),
                user.getFirstName(), user.getLastName(), user.getFiliere());
        response.setId(user.getId());
        response.setAvatarColor(user.getAvatarColor());
        response.setEmail(user.getEmail());
        response.setClub(user.getClub());
        return response;
    }

    private UserDto toUserDto(AppUser user) {
        return new UserDto(user.getId(), user.getUsername(), user.getRole(),
                user.getFirstName(), user.getLastName(), user.getFiliere(), user.getEmail(), user.getClub());
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserDto)
                .toList();
    }

    @Transactional
    public UserDto createUser(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom d'utilisateur et mot de passe requis");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce nom d'utilisateur existe déjà");
        }
        String role = request.getRole() == null || request.getRole().isBlank()
                ? "USER" : request.getRole().toUpperCase();
        if (!VALID_ROLES.contains(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role invalide");
        }
        if ("CHEF_FILIERE".equals(role)
                && (request.getFiliere() == null || request.getFiliere().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La filière est requise pour le rôle Chef de filière");
        }
        String email = normalizeEmail(request.getEmail());
        if (email != null) {
            if (!INSTITUTIONAL_EMAIL.matcher(email).matches()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Email institutionnel invalide (format attendu : prenom.nom.fst@uhp.ac.ma)");
            }
            if (userRepository.existsByEmail(email)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé");
            }
        }
        AppUser user = new AppUser(request.getUsername(), passwordEncoder.encode(request.getPassword()), role);
        user.setEmail(email);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setFiliere(request.getFiliere());
        user.setClub(request.getClub());
        return toUserDto(userRepository.save(user));
    }

    @Transactional
    public UserDto updateUserRole(Long id, String newRole) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        if (!VALID_ROLES.contains(newRole.toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role invalide");
        }
        user.setRole(newRole.toUpperCase());
        AppUser saved = userRepository.save(user);
        return toUserDto(saved);
    }

    @Transactional
    public UserDto updateUserFiliere(Long id, String filiere) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        user.setFiliere(filiere);
        AppUser saved = userRepository.save(user);
        return toUserDto(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable");
        }
        userRepository.deleteById(id);
    }

    @Transactional
    public AuthResponse updateProfile(String currentUsername, com.example.authservice.model.UpdateProfileRequest request) {
        AppUser user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Mot de passe actuel incorrect");
        }

        if (request.getNewUsername() != null && !request.getNewUsername().isBlank()
                && !request.getNewUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getNewUsername())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce nom d'utilisateur est déjà pris");
            }
            user.setUsername(request.getNewUsername());
        }

        if (request.getNewEmail() != null && !request.getNewEmail().isBlank()) {
            String newEmail = normalizeEmail(request.getNewEmail());
            if (!INSTITUTIONAL_EMAIL.matcher(newEmail).matches()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Email institutionnel invalide (format attendu : prenom.nom.fst@uhp.ac.ma)");
            }
            if (!newEmail.equals(user.getEmail())) {
                if (userRepository.existsByEmail(newEmail)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Cet email est déjà utilisé");
                }
                user.setEmail(newEmail);
            }
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        if (request.getAvatarColor() != null && !request.getAvatarColor().isBlank()) {
            user.setAvatarColor(request.getAvatarColor());
        }

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName());
        }
        if (request.getFiliere() != null) {
            user.setFiliere(request.getFiliere());
        }

        AppUser saved = userRepository.save(user);
        String refresh = createRefreshToken(saved.getUsername());
        return toAuthResponse(saved, refresh);
    }
}