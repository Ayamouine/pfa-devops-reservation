package com.example.bookingservice.config;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.bookingservice.entity.BookingEntity;
import com.example.bookingservice.entity.ResourceEntity;
import com.example.bookingservice.repository.BookingRepository;
import com.example.bookingservice.repository.ResourceRepository;

@Configuration
public class BookingDataLoader {

    private static final String CRE1 = "08:30-10:30";
    private static final String CRE2 = "10:30-12:30";
    private static final String CRE3 = "14:00-16:00";
    private static final String CRE4 = "16:00-18:00";

    @Bean
    CommandLineRunner seedResources(ResourceRepository resourceRepository) {
        return args -> {
            if (resourceRepository.count() > 0) {
                return;
            }
            resourceRepository.save(resource("Amphithéâtre A", "AMPHI", 250, "Bâtiment A", "Rez-de-chaussée",
                    "Vidéoprojecteur, sonorisation, tableau blanc", 0.0,
                    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=60"));
            resourceRepository.save(resource("Amphithéâtre B", "AMPHI", 200, "Bâtiment A", "Rez-de-chaussée",
                    "Vidéoprojecteur, sonorisation", 0.0,
                    "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800&q=60"));
            resourceRepository.save(resource("Amphithéâtre C", "AMPHI", 180, "Bâtiment B", "Rez-de-chaussée",
                    "Vidéoprojecteur, climatisation", 0.0,
                    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=60"));
            resourceRepository.save(resource("Salle de cours A101", "SALLE", 60, "Bâtiment A", "1er étage",
                    "Vidéoprojecteur, tableau blanc", 0.0,
                    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=60"));
            resourceRepository.save(resource("Salle de cours A102", "SALLE", 45, "Bâtiment A", "1er étage",
                    "Vidéoprojecteur", 0.0, null));
            resourceRepository.save(resource("Salle de cours B201", "SALLE", 40, "Bâtiment B", "2ème étage",
                    "Tableau blanc, climatisation", 0.0, null));
            resourceRepository.save(resource("Salle TP Informatique 1", "TP", 24, "Bâtiment C", "1er étage",
                    "24 postes, réseau, vidéoprojecteur", 0.0,
                    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=60"));
            resourceRepository.save(resource("Salle TP Informatique 2", "TP", 24, "Bâtiment C", "1er étage",
                    "24 postes, réseau", 0.0, null));
            resourceRepository.save(resource("Salle TP Réseaux", "TP", 20, "Bâtiment C", "2ème étage",
                    "Bancs réseau, switches, serveurs", 0.0, null));
            resourceRepository.save(resource("Salle de réunion — Conseil", "REUNION", 16, "Bâtiment Direction",
                    "1er étage", "Écran, visioconférence", 0.0,
                    "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&q=60"));
            resourceRepository.save(resource("Salle de réunion — Département", "REUNION", 12, "Bâtiment B",
                    "1er étage", "Tableau blanc, écran", 0.0, null));
            resourceRepository.save(resource("Salle de conférence", "REUNION", 80, "Bâtiment Direction",
                    "Rez-de-chaussée", "Sonorisation, vidéoprojecteur, estrade", 0.0, null));
            resourceRepository.save(resource("Laboratoire Génie Civil", "AUTRE", 30, "Bâtiment D", "Rez-de-chaussée",
                    "Équipements de laboratoire, EPI", 0.0, null));
        };
    }

    @Bean
    CommandLineRunner seedBookings(BookingRepository bookingRepository) {
        return args -> {
            if (bookingRepository.count() > 0) {
                return;
            }
            bookingRepository.save(booking("Salle de cours A101", LocalDate.now().plusDays(3), CRE1,
                    "PENDING", "prof", "Informatique",
                    "Cours de développement web (2AP)",
                    "PENDING|prof|Demande de réservation créée"));

            bookingRepository.save(booking("Salle de cours A102", LocalDate.now().plusDays(4), CRE2,
                    "APPROVED", "prof", "Informatique",
                    "TP encadré de bases de données",
                    "PENDING|prof|Demande de réservation créée",
                    "APPROVED|chef|Salle disponible, demande validée"));

            bookingRepository.save(booking("Salle TP Informatique 1", LocalDate.now().plusDays(5), CRE3,
                    "CONFIRMED", "prof", "Informatique",
                    "Examen pratique de programmation",
                    "PENDING|prof|Demande de réservation créée",
                    "APPROVED|chef|Validé",
                    "CONFIRMED|doyen|Cachet final apposé",
                    "PAYMENT|payment-service|Paiement simulé effectué (0.0 MAD)"));
        };
    }

    private ResourceEntity resource(String name, String category, int capacity, String building, String floor,
                                    String equipment, double price, String photo) {
        ResourceEntity entity = new ResourceEntity(name, category, capacity, null, equipment, price);
        entity.setBuilding(building);
        entity.setFloor(floor);
        entity.setPhoto(photo);
        return entity;
    }

    private BookingEntity booking(String resource, LocalDate date, String creneau, String status,
                                  String username, String filiere, String motif, String... history) {
        BookingEntity entity = new BookingEntity(resource, date, status, username);
        entity.setCreneau(creneau);
        entity.setFiliere(filiere);
        entity.setMotif(motif);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        for (String step : history) {
            String[] parts = step.split("\\|", 3);
            entity.addHistory(parts[0], parts.length > 1 ? parts[1] : username,
                    parts.length > 2 ? parts[2] : null);
        }
        return entity;
    }
}
