package com.example.authservice.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.authservice.entity.AppUser;
import com.example.authservice.repository.AppUserRepository;

@Configuration
public class UserDataLoader {

    private static final String INFO = "GI";

    private static final List<String> CLUBS = List.of("CLIC", "CTDE", "BAC", "BTEC", "FIRE", "CODE");

    @Bean
    CommandLineRunner seedUsers(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            upsert(userRepository, passwordEncoder, "admin", "admin123", "ADMIN",
                    "Salma", "El Idrissi", null, null, "salma.elidrissi@gmail.com");
            upsert(userRepository, passwordEncoder, "doyen", "doyen123", "DOYEN",
                    "Karim", "Benali", null, null, "karim.benali@gmail.com");
            upsert(userRepository, passwordEncoder, "chef", "chef123", "CHEF_FILIERE",
                    "Nadia", "Alaoui", INFO, null, "nadia.alaoui@gmail.com");
            upsert(userRepository, passwordEncoder, "prof", "prof123", "PROF",
                    "Youssef", "Tazi", INFO, null, "youssef.tazi@gmail.com");
            upsert(userRepository, passwordEncoder, "etudiant", "etudiant123", "ETUDIANT",
                    "Imane", "Rachidi", INFO, null, "imane.rachidi.fst@uhp.ac.ma");

            for (String club : CLUBS) {
                String slug = club.toLowerCase();
                upsert(userRepository, passwordEncoder, "club." + slug, "club123", "CLUB",
                        "Club " + club, "", null, club, "club." + slug + "@gmail.com");
            }
        };
    }

    private void upsert(AppUserRepository userRepository, PasswordEncoder passwordEncoder,
                        String username, String password, String role, String firstName, String lastName,
                        String filiere, String club, String email) {
        AppUser existing = userRepository.findByUsername(username).orElse(null);
        if (existing == null) {
            userRepository.save(user(username, password, role, firstName, lastName, filiere, club, email, passwordEncoder));
        } else {
            boolean dirty = false;
            if (existing.getEmail() == null || existing.getEmail().isBlank()) {
                existing.setEmail(email);
                dirty = true;
            }
            if (club != null && (existing.getClub() == null || existing.getClub().isBlank())) {
                existing.setClub(club);
                dirty = true;
            }
            if (dirty) {
                userRepository.save(existing);
            }
        }
    }

    private AppUser user(String username, String password, String role, String firstName, String lastName,
                         String filiere, String club, String email, PasswordEncoder passwordEncoder) {
        AppUser user = new AppUser(username, passwordEncoder.encode(password), role);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setFiliere(filiere);
        user.setClub(club);
        user.setEmail(email);
        return user;
    }
}
