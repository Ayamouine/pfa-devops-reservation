package com.example.bookingservice.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

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

    private static final List<String> EQ_AMPHI = List.of("Projecteur", "Tableau blanc", "Audio");
    private static final List<String> EQ_TD = List.of("Projecteur", "Tableau blanc");
    private static final List<String> EQ_TP = List.of("Ordinateurs", "Prises réseau", "Projecteur");
    private static final List<String> EQ_CENTRAL =
            List.of("Projecteur", "Tableau blanc", "Audio", "Visio", "Climatisation");

    @Bean
    CommandLineRunner seedResources(ResourceRepository resourceRepository) {
        return args -> {
            if (resourceRepository.count() > 0) {
                return;
            }

            for (int i = 1; i <= 6; i++) {
                resourceRepository.save(resource("Amphi " + i, "AMPHI", "AMPHI", 200,
                        "Amphithéâtres", "RDC", EQ_AMPHI));
            }

            for (String bloc : List.of("A", "B", "C", "D")) {
                seedBloc(resourceRepository, bloc);
            }

            resourceRepository.save(resource("Amphi NB1", "AMPHI", "AMPHI", 150,
                    "Cycle Ingénieur", "RDC", EQ_AMPHI));
            resourceRepository.save(resource("Amphi NB2", "AMPHI", "AMPHI", 150,
                    "Cycle Ingénieur", "RDC", EQ_AMPHI));
            for (int niveau = 0; niveau <= 2; niveau++) {
                for (int salle = 1; salle <= 6; salle++) {
                    resourceRepository.save(resource("Salle NB" + numero(niveau, salle), "TD", "TD", 40,
                            "Cycle Ingénieur", niveauLabel(niveau), EQ_TD));
                }
            }

            resourceRepository.save(resource("Amphi Central", "AMPHI", "AMPHI", 500,
                    "Amphi Central", "RDC", EQ_CENTRAL));
        };
    }

    private void seedBloc(ResourceRepository resourceRepository, String bloc) {
        boolean blocTP = "B".equals(bloc) || "C".equals(bloc);
        for (int niveau = 0; niveau <= 2; niveau++) {
            for (int salle = 1; salle <= 6; salle++) {
                String type = "TD";
                List<String> equipments = EQ_TD;
                if (blocTP) {
                    type = "TP";
                    equipments = EQ_TP;
                } else if (niveau == 0 && salle <= 2) {
                    type = "TP";
                    equipments = EQ_TP;
                }
                resourceRepository.save(resource("Salle " + bloc + numero(niveau, salle), type, type,
                        capacite(type), "Bloc " + bloc, niveauLabel(niveau), equipments));
            }
        }
    }

    private String numero(int niveau, int salle) {
        return String.format("%02d", niveau * 10 + salle);
    }

    private String niveauLabel(int niveau) {
        if (niveau == 0) {
            return "RDC";
        }
        return niveau == 1 ? "1er étage" : niveau + "e étage";
    }

    private int capacite(String type) {
        return "TD".equals(type) ? 40 : 30;
    }

    @Bean
    CommandLineRunner seedBookings(BookingRepository bookingRepository) {
        return args -> {
            if (bookingRepository.count() > 0) {
                return;
            }
            bookingRepository.save(booking("Amphi 1", LocalDate.now().plusDays(3), CRE1,
                    "PENDING", "prof", "GI",
                    "Cours de développement web (2AP)",
                    "PENDING|prof|Demande de réservation créée"));

            bookingRepository.save(booking("Salle A11", LocalDate.now().plusDays(4), CRE2,
                    "APPROVED", "prof", "GI",
                    "TP encadré de bases de données",
                    "PENDING|prof|Demande de réservation créée",
                    "APPROVED|chef|Salle disponible, demande validée"));

            bookingRepository.save(booking("Salle C01", LocalDate.now().plusDays(5), CRE3,
                    "CONFIRMED", "prof", "GI",
                    "Examen pratique de programmation",
                    "PENDING|prof|Demande de réservation créée",
                    "APPROVED|chef|Validé",
                    "CONFIRMED|doyen|Cachet final apposé",
                    "PAYMENT|payment-service|Paiement simulé effectué (0.0 MAD)"));
        };
    }

    private ResourceEntity resource(String name, String category, String type, int capacity, String building,
                                    String floor, List<String> equipments) {
        ResourceEntity entity = new ResourceEntity();
        entity.setName(name);
        entity.setCategory(category);
        entity.setType(type);
        entity.setCapacity(capacity);
        entity.setBuilding(building);
        entity.setFloor(floor);
        entity.setEquipment(String.join(", ", equipments));
        entity.setEquipments(new HashSet<>(equipments));
        entity.setPrice(0.0);
        entity.setActive(true);
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
