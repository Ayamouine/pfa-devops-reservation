package com.example.bookingservice.config;

import java.time.LocalDate;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.bookingservice.entity.BookingEntity;
import com.example.bookingservice.repository.BookingRepository;

@Configuration
public class BookingDataLoader {

    @Bean
    CommandLineRunner seedBookings(BookingRepository bookingRepository) {
        return args -> {
            if (bookingRepository.count() == 0) {
                bookingRepository.save(new BookingEntity("Salle A", LocalDate.of(2026, 7, 30), "confirmed"));
                bookingRepository.save(new BookingEntity("Salle B", LocalDate.of(2026, 8, 1), "pending"));
            }
        };
    }
}
