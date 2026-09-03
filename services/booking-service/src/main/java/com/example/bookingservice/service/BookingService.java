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

    public List<Booking> getBookingsForUser(String username) {
        return bookingRepository.findByUsername(username).stream().map(this::toModel).toList();
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        LocalDate reservationDate = LocalDate.parse(booking.getDate());

        if (bookingRepository.existsByResourceAndReservationDate(booking.getResource(), reservationDate)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This resource is already booked for the selected date");
        }

        String username = booking.getUsername() == null || booking.getUsername().isBlank()
                ? "guest"
                : booking.getUsername();

        BookingEntity saved = bookingRepository.save(new BookingEntity(
                booking.getResource(),
                reservationDate,
                booking.getStatus() == null ? "pending" : booking.getStatus(),
                username));

        notificationClient.sendReservationNotification(
            saved.getUsername(),
            saved.getResource(),
            saved.getReservationDate().toString(),
            saved.getStatus());

        return toModel(saved);
    }

    @Transactional
    public Booking confirmBooking(Long id, String requesterUsername, String requesterRole) {
        BookingEntity entity = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        boolean isOwner = entity.getUsername() != null && entity.getUsername().equals(requesterUsername);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(requesterRole);

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only confirm your own reservations");
        }

        entity.setStatus("confirmed");
        BookingEntity saved = bookingRepository.save(entity);

        notificationClient.sendReservationNotification(
            saved.getUsername(),
            saved.getResource(),
            saved.getReservationDate().toString(),
            "confirmed");

        return toModel(saved);
    }

    @Transactional
    public Booking updateBooking(Long id, Booking updatedBooking, String requesterUsername, String requesterRole) {
        BookingEntity entity = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        boolean isOwner = entity.getUsername() != null && entity.getUsername().equals(requesterUsername);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(requesterRole);

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only modify your own reservations");
        }

        LocalDate newDate = LocalDate.parse(updatedBooking.getDate());
        String newResource = updatedBooking.getResource();

        boolean changed = !newResource.equals(entity.getResource()) || !newDate.equals(entity.getReservationDate());
        if (changed && bookingRepository.existsByResourceAndReservationDate(newResource, newDate)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This resource is already booked for the selected date");
        }

        entity.setResource(newResource);
        entity.setReservationDate(newDate);
        entity.setStatus("pending");
        BookingEntity saved = bookingRepository.save(entity);

        notificationClient.sendReservationNotification(
            saved.getUsername(),
            saved.getResource(),
            saved.getReservationDate().toString(),
            "modifiee");

        return toModel(saved);
    }

    @Transactional
    public void cancelBooking(Long id, String requesterUsername, String requesterRole) {
        BookingEntity entity = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        boolean isOwner = entity.getUsername() != null && entity.getUsername().equals(requesterUsername);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(requesterRole);

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only cancel your own reservations");
        }

        bookingRepository.delete(entity);

        notificationClient.sendReservationNotification(
            entity.getUsername(),
            entity.getResource(),
            entity.getReservationDate().toString(),
            "cancelled");
    }

    private Booking toModel(BookingEntity entity) {
        return new Booking(entity.getId(), entity.getResource(), entity.getReservationDate().toString(),
                entity.getStatus(), entity.getUsername());
    }
}