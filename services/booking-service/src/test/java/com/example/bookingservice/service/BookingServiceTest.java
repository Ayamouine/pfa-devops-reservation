package com.example.bookingservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import com.example.bookingservice.entity.BookingEntity;
import com.example.bookingservice.model.Booking;
import com.example.bookingservice.repository.BookingRepository;

class BookingServiceTest {

    private BookingRepository bookingRepository;
    private NotificationClient notificationClient;
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingRepository = mock(BookingRepository.class);
        notificationClient = mock(NotificationClient.class);
        bookingService = new BookingService(bookingRepository, notificationClient);
    }

    @Test
    void createBooking_savesBooking_whenResourceIsAvailable() {
        Booking request = new Booking(null, "Salle A", "2026-08-01", null, "aya");

        when(bookingRepository.existsByResourceAndReservationDate("Salle A", LocalDate.parse("2026-08-01")))
                .thenReturn(false);
        when(bookingRepository.save(any(BookingEntity.class)))
                .thenAnswer(invocation -> {
                    BookingEntity entity = invocation.getArgument(0);
                    entity.setId(1L);
                    return entity;
                });

        Booking result = bookingService.createBooking(request);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getResource()).isEqualTo("Salle A");
        assertThat(result.getStatus()).isEqualTo("pending");
        verify(notificationClient).sendReservationNotification("aya", "Salle A", "2026-08-01", "pending");
    }

    @Test
    void createBooking_throwsConflict_whenResourceAlreadyBookedForSameDate() {
        Booking request = new Booking(null, "Salle A", "2026-08-01", null, "aya");

        when(bookingRepository.existsByResourceAndReservationDate("Salle A", LocalDate.parse("2026-08-01")))
                .thenReturn(true);

        assertThatThrownBy(() -> bookingService.createBooking(request))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("already booked");

        verify(bookingRepository, never()).save(any(BookingEntity.class));
        verify(notificationClient, never())
                .sendReservationNotification(any(), any(), any(), any());
    }

    @Test
    void createBooking_allowsSameResource_onDifferentDate() {
        Booking request = new Booking(null, "Salle A", "2026-09-15", null, "aya");

        when(bookingRepository.existsByResourceAndReservationDate("Salle A", LocalDate.parse("2026-09-15")))
                .thenReturn(false);
        when(bookingRepository.save(any(BookingEntity.class)))
                .thenAnswer(invocation -> {
                    BookingEntity entity = invocation.getArgument(0);
                    entity.setId(2L);
                    return entity;
                });

        Booking result = bookingService.createBooking(request);

        assertThat(result.getResource()).isEqualTo("Salle A");
        assertThat(result.getDate()).isEqualTo("2026-09-15");
    }

    @Test
    void cancelBooking_deletesBooking_whenRequesterIsOwner() {
        BookingEntity entity = new BookingEntity("Salle A", LocalDate.parse("2026-08-01"), "pending", "aya");
        entity.setId(1L);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(entity));

        bookingService.cancelBooking(1L, "aya", "USER");

        verify(bookingRepository).delete(entity);
    }

    @Test
    void cancelBooking_deletesBooking_whenRequesterIsAdmin() {
        BookingEntity entity = new BookingEntity("Salle A", LocalDate.parse("2026-08-01"), "pending", "aya");
        entity.setId(1L);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(entity));

        bookingService.cancelBooking(1L, "someAdmin", "ADMIN");

        verify(bookingRepository).delete(entity);
    }

    @Test
    void cancelBooking_throwsForbidden_whenRequesterIsNotOwnerNorAdmin() {
        BookingEntity entity = new BookingEntity("Salle A", LocalDate.parse("2026-08-01"), "pending", "aya");
        entity.setId(1L);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(entity));

        assertThatThrownBy(() -> bookingService.cancelBooking(1L, "otherUser", "USER"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("only cancel");

        verify(bookingRepository, never()).delete(any(BookingEntity.class));
    }

    @Test
    void cancelBooking_throwsNotFound_whenBookingDoesNotExist() {
        when(bookingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.cancelBooking(99L, "aya", "USER"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not found");
    }
}
