package com.example.bookingservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.eq;
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
import com.example.bookingservice.repository.ResourceRepository;

class BookingServiceTest {

    private BookingRepository bookingRepository;
    private ResourceRepository resourceRepository;
    private NotificationClient notificationClient;
    private PaymentClient paymentClient;
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        bookingRepository = mock(BookingRepository.class);
        resourceRepository = mock(ResourceRepository.class);
        notificationClient = mock(NotificationClient.class);
        paymentClient = mock(PaymentClient.class);
        bookingService = new BookingService(bookingRepository, resourceRepository, notificationClient, paymentClient);
    }

    private BookingEntity savedEntity(BookingEntity entity) {
        entity.setId(1L);
        return entity;
    }

    @Test
    void createBooking_savesPendingBookingWithWorkflowFields() {
        Booking request = new Booking(null, "Salle A", "2026-08-01", null, "aya");
        request.setCreneau("08:30-10:30");
        request.setMotif("Cours Mathématiques");
        request.setFiliere("GI");

        when(bookingRepository.existsByResourceAndReservationDateAndCreneau("Salle A", LocalDate.parse("2026-08-01"), "08:30-10:30"))
                .thenReturn(false);
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(inv -> savedEntity(inv.getArgument(0)));

        Booking result = bookingService.createBooking(request, "aya", "PROF");

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getResource()).isEqualTo("Salle A");
        assertThat(result.getStatus()).isEqualTo("PENDING");
        assertThat(result.getCreneau()).isEqualTo("08:30-10:30");
        assertThat(result.getMotif()).isEqualTo("Cours Mathématiques");
        assertThat(result.getFiliere()).isEqualTo("GI");
        verify(notificationClient).sendWorkflowNotification(eq("aya"), any(), any(), eq("BOOKING_CREATED"), any());
        verify(notificationClient).sendWorkflowNotification(eq(null), eq("ROLE:CHEF_FILIERE:GI"), any(), any(), any());
    }

    @Test
    void createBooking_throwsConflict_whenResourceBookedForSameDateAndCreneau() {
        Booking request = new Booking(null, "Salle A", "2026-08-01", null, "aya");
        request.setCreneau("08:30-10:30");

        when(bookingRepository.existsByResourceAndReservationDateAndCreneau("Salle A", LocalDate.parse("2026-08-01"), "08:30-10:30"))
                .thenReturn(true);

        assertThatThrownBy(() -> bookingService.createBooking(request, "aya", "PROF"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("déjà réservée");

        verify(bookingRepository, never()).save(any(BookingEntity.class));
    }

    @Test
    void approveBooking_movesToApproved_andNotifiesRequesterAndDoyen() {
        BookingEntity entity = new BookingEntity("Salle A", LocalDate.parse("2026-08-01"), "PENDING", "aya");
        entity.setId(1L);
        entity.setFiliere("GI");
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.approveBooking(1L, "OK, cours validé", "chefGI", "CHEF_FILIERE", "GI");

        assertThat(result.getStatus()).isEqualTo("APPROVED");
        assertThat(result.getChefComment()).isEqualTo("OK, cours validé");
        verify(notificationClient).sendWorkflowNotification(eq("aya"), any(), any(), eq("BOOKING_APPROVED"), any());
        verify(notificationClient).sendWorkflowNotification(eq(null), eq("ROLE:DOYEN"), any(), any(), any());
    }

    @Test
    void approveBooking_forbidsNonChefRole() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(
                new BookingEntity("Salle A", LocalDate.parse("2026-08-01"), "PENDING", "aya")));

        assertThatThrownBy(() -> bookingService.approveBooking(1L, "OK", "prof1", "PROF", "GI"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("réservée au chef de filière");
    }

    @Test
    void approveBooking_forbidsOtherFiliere() {
        BookingEntity entity = new BookingEntity("Salle A", LocalDate.parse("2026-08-01"), "PENDING", "aya");
        entity.setId(1L);
        entity.setFiliere("GI");
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(entity));

        assertThatThrownBy(() -> bookingService.approveBooking(1L, "OK", "chefCM", "CHEF_FILIERE", "CM"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("pas à votre filière");
    }

    @Test
    void confirmBooking_requiresDoyenRole() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(new BookingEntity("Salle A", LocalDate.parse("2026-08-01"), "APPROVED", "aya")));

        assertThatThrownBy(() -> bookingService.confirmBooking(1L, null, "user1", "USER"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Seul le doyen");
    }

    @Test
    void confirmBooking_confirmsAndTriggersPayment() {
        BookingEntity entity = new BookingEntity("Salle A", LocalDate.parse("2026-08-01"), "APPROVED", "aya");
        entity.setId(1L);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(resourceRepository.findByNameIgnoreCase("Salle A")).thenReturn(Optional.empty());
        when(paymentClient.processSimulatedPayment(eq(1L), eq("aya"), eq(0.0))).thenReturn(true);

        Booking result = bookingService.confirmBooking(1L, "Cachet apposé", "doyen", "DOYEN");

        assertThat(result.getStatus()).isEqualTo("CONFIRMED");
        verify(paymentClient).processSimulatedPayment(eq(1L), eq("aya"), anyDouble());
        verify(notificationClient).sendWorkflowNotification(eq("aya"), any(), any(), eq("BOOKING_CONFIRMED"), any());
    }

    @Test
    void rejectBooking_byChef_setsRejected() {
        BookingEntity entity = new BookingEntity("Salle A", LocalDate.parse("2026-08-01"), "PENDING", "aya");
        entity.setId(1L);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        Booking result = bookingService.rejectBooking(1L, "Créneau indisponible", "chefGI", "CHEF_FILIERE");

        assertThat(result.getStatus()).isEqualTo("REJECTED");
        assertThat(result.getChefComment()).isEqualTo("Créneau indisponible");
        verify(notificationClient).sendWorkflowNotification(any(), any(), any(), eq("BOOKING_REJECTED"), any());
    }

    @Test
    void cancelBooking_deletesBooking_whenRequesterIsOwner() {
        BookingEntity entity = new BookingEntity("Salle A", LocalDate.parse("2026-08-01"), "PENDING", "aya");
        entity.setId(1L);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(entity));

        bookingService.cancelBooking(1L, "aya", "USER");

        verify(bookingRepository).delete(entity);
    }

    @Test
    void cancelBooking_throwsForbidden_whenRequesterIsNotOwnerNorAdmin() {
        BookingEntity entity = new BookingEntity("Salle A", LocalDate.parse("2026-08-01"), "PENDING", "aya");
        entity.setId(1L);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(entity));

        assertThatThrownBy(() -> bookingService.cancelBooking(1L, "otherUser", "USER"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("annuler");

        verify(bookingRepository, never()).delete(any(BookingEntity.class));
    }

    @Test
    void attachDocument_acceptsPdf_whenOwner() {
        BookingEntity entity = new BookingEntity("Salle A", LocalDate.parse("2026-08-01"), "PENDING", "aya");
        entity.setId(1L);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(entity));
        when(bookingRepository.save(any(BookingEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        byte[] pdf = new byte[]{0x25, 0x50, 0x44, 0x46};
        Booking result = bookingService.attachDocument(1L, "justificatif.pdf", "application/pdf", pdf, "aya", "PROF");

        assertThat(result.isHasDocument()).isTrue();
        assertThat(result.getDocumentName()).isEqualTo("justificatif.pdf");
    }

    @Test
    void getBooking_throwsNotFound_whenMissing() {
        when(bookingRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookingService.getBooking(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("introuvable");
    }
}