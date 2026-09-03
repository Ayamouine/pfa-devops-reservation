package com.example.bookingservice.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bookingservice.entity.BookingEntity;

public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
    boolean existsByResourceAndReservationDate(String resource, LocalDate reservationDate);
    List<BookingEntity> findByResource(String resource);
    List<BookingEntity> findByUsername(String username);
}
