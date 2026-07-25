package com.example.bookingservice.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.bookingservice.entity.BookingEntity;
import com.example.bookingservice.model.Booking;
import com.example.bookingservice.repository.BookingRepository;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final NotificationClient notificationClient;

    public BookingService(BookingRepository bookingRepository, NotificationClient notificationClient) {
        this.bookingRepository = bookingRepository;
        this.notificationClient = notificationClient;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::toModel).toList();
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        LocalDate reservationDate = LocalDate.parse(booking.getDate());

        if (bookingRepository.existsByResourceAndReservationDate(booking.getResource(), reservationDate)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This resource is already booked for the selected date");
        }

        BookingEntity saved = bookingRepository.save(new BookingEntity(
                booking.getResource(),
                reservationDate,
                booking.getStatus() == null ? "pending" : booking.getStatus()));

        notificationClient.sendReservationNotification(
            "aya",
            saved.getResource(),
            saved.getReservationDate().toString(),
            saved.getStatus());

        return toModel(saved);
    }

    private Booking toModel(BookingEntity entity) {
        return new Booking(entity.getId(), entity.getResource(), entity.getReservationDate().toString(), entity.getStatus());
    }
}
