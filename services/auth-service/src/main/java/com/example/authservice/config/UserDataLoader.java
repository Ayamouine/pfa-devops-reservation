package com.example.authservice.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.authservice.entity.AppUser;
import com.example.authservice.repository.AppUserRepository;

@Configuration
public class UserDataLoader {

    private static final String INFO = "Informatique";

    @Bean
    CommandLineRunner seedUsers(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }
            userRepository.save(user("admin", "admin123", "ADMIN", "Salma", "El Idrissi", null, passwordEncoder));
            userRepository.save(user("doyen", "doyen123", "DOYEN", "Karim", "Benali", null, passwordEncoder));
            userRepository.save(user("chef", "chef123", "CHEF_FILIERE", "Nadia", "Alaoui", INFO, passwordEncoder));
            userRepository.save(user("prof", "prof123", "PROF", "Youssef", "Tazi", INFO, passwordEncoder));
            userRepository.save(user("etudiant", "etudiant123", "ETUDIANT", "Imane", "Rachidi", INFO, passwordEncoder));
        };
    }

    private AppUser user(String username, String password, String role, String firstName, String lastName,
                         String filiere, PasswordEncoder passwordEncoder) {
        AppUser user = new AppUser(username, passwordEncoder.encode(password), role);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setFiliere(filiere);
        return user;
    }
}
