package com.example.bookingservice.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.bookingservice.entity.BookingEntity;
import com.example.bookingservice.model.Booking;
import com.example.bookingservice.model.WorkflowStepDto;
import com.example.bookingservice.repository.BookingRepository;
import com.example.bookingservice.repository.ResourceRepository;

@Service
public class BookingService {
    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_CONFIRMED = "CONFIRMED";
    public static final String STATUS_CANCELLED = "CANCELLED";

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationClient notificationClient;
    private final PaymentClient paymentClient;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository,
                          NotificationClient notificationClient,
                          PaymentClient paymentClient) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.notificationClient = notificationClient;
        this.paymentClient = paymentClient;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::toModel).toList();
    }

    public List<Booking> getBookingsForUser(String username) {
        return bookingRepository.findByUsername(username).stream().map(this::toModel).toList();
    }

    public List<Booking> getBookingsForFiliere(String filiere) {
        return bookingRepository.findByFiliere(filiere).stream()
                .filter(b -> !STATUS_CONFIRMED.equalsIgnoreCase(b.getStatus()))
                .map(this::toModel)
                .toList();
    }

    public List<Booking> getBookingsForDoyen() {
        return bookingRepository.findAll().stream()
                .filter(b -> STATUS_APPROVED.equalsIgnoreCase(b.getStatus()))
                .map(this::toModel)
                .toList();
    }

    public Booking getBooking(Long id) {
        return toModel(bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable")));
    }

    public boolean isAvailable(String resource, LocalDate date) {
        return !bookingRepository.existsByResourceAndReservationDate(resource, date);
    }

    public boolean isAvailable(String resource, LocalDate date, String creneau) {
        return !bookingRepository.existsByResourceAndReservationDateAndCreneau(resource, date, creneau);
    }

    @Transactional
    public Booking createBooking(Booking booking, String requester, String requesterRole) {
        if ("ETUDIANT".equalsIgnoreCase(requesterRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Les étudiants consultent les salles et l'emploi du temps mais ne réservent pas");
        }
        LocalDate reservationDate = LocalDate.parse(booking.getDate());
        String creneau = booking.getCreneau() == null || booking.getCreneau().isBlank()
                ? "08:30-10:30"
                : booking.getCreneau();

        boolean occupied = bookingRepository.existsByResourceAndReservationDateAndCreneau(booking.getResource(), reservationDate, creneau);
        if (occupied) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cette salle est déjà réservée pour la date et le créneau choisis");
        }

        String username = booking.getUsername() == null || booking.getUsername().isBlank()
                ? requester
                : booking.getUsername();

        BookingEntity entity = new BookingEntity(booking.getResource(), reservationDate, STATUS_PENDING, username);
        entity.setCreneau(creneau);
        entity.setMotif(booking.getMotif());
        entity.setFiliere(booking.getFiliere());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        entity.addHistory(STATUS_PENDING, requester, "Demande de réservation créée");

        BookingEntity saved = bookingRepository.save(entity);

        String link = "/reservations";
        notificationClient.sendWorkflowNotification(
                saved.getUsername(), null,
                "Demande de réservation #" + saved.getId() + " créée pour " + saved.getResource()
                        + " le " + saved.getReservationDate() + " (" + creneau + ")",
                "BOOKING_CREATED", link);
        if (saved.getFiliere() != null && !saved.getFiliere().isBlank()) {
            notificationClient.sendWorkflowNotification(
                    null, "ROLE:CHEF_FILIERE:" + saved.getFiliere(),
                    "Nouvelle demande #" + saved.getId() + " de " + saved.getUsername()
                            + " (" + saved.getResource() + ", " + saved.getReservationDate() + " " + creneau + ")",
                    "BOOKING_PENDING_APPROVAL", "/validations");
        }

        return toModel(saved);
    }

    @Transactional
    public Booking approveBooking(Long id, String comment, String actor, String actorFiliere) {
        BookingEntity entity = require(id);
        if (!STATUS_PENDING.equalsIgnoreCase(entity.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette demande n'est plus en attente");
        }
        if (entity.getFiliere() != null && !entity.getFiliere().isBlank()
                && actorFiliere != null && !actorFiliere.equalsIgnoreCase(entity.getFiliere())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cette demande n'appartient pas à votre filière");
        }
        entity.setStatus(STATUS_APPROVED);
        entity.setChefComment(comment);
        entity.setUpdatedAt(LocalDateTime.now());
        entity.addHistory(STATUS_APPROVED, actor, comment);
        BookingEntity saved = bookingRepository.save(entity);

        notificationClient.sendWorkflowNotification(
                saved.getUsername(), null,
                "Votre demande #" + saved.getId() + " a été validée par le chef de filière",
                "BOOKING_APPROVED", "/reservations");
        notificationClient.sendWorkflowNotification(
                null, "ROLE:DOYEN",
                "Demande #" + saved.getId() + " (" + saved.getResource() + ", " + saved.getReservationDate()
                        + ") validée par le chef de filière, en attente du cachet final",
                "BOOKING_APPROVAL_PENDING", "/validations");

        return toModel(saved);
    }

    @Transactional
    public Booking rejectBooking(Long id, String comment, String actor, String actorRole) {
        BookingEntity entity = require(id);
        boolean isChef = "CHEF_FILIERE".equalsIgnoreCase(actorRole);
        boolean isDoyen = "DOYEN".equalsIgnoreCase(actorRole);
        if (!isChef && !isDoyen) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Action réservée au chef de filière ou au doyen");
        }
        if (isDoyen && !STATUS_APPROVED.equalsIgnoreCase(entity.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La demande doit d'abord être validée par le chef de filière");
        }
        entity.setStatus(STATUS_REJECTED);
        if (isChef) {
            entity.setChefComment(comment);
        } else {
            entity.setDoyenComment(comment);
        }
        entity.setUpdatedAt(LocalDateTime.now());
        entity.addHistory(STATUS_REJECTED, actor, comment);
        BookingEntity saved = bookingRepository.save(entity);

        String who = isDoyen ? "le doyen" : "le chef de filière";
        notificationClient.sendWorkflowNotification(
                saved.getUsername(), null,
                "Votre demande #" + saved.getId() + " a été refusée par " + who
                        + (comment != null && !comment.isBlank() ? " : " + comment : ""),
                "BOOKING_REJECTED", "/reservations");

        return toModel(saved);
    }

    @Transactional
    public Booking confirmBooking(Long id, String comment, String actor, String actorRole) {
        if (!"DOYEN".equalsIgnoreCase(actorRole) && !"ADMIN".equalsIgnoreCase(actorRole)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seul le doyen peut apposer le cachet final");
        }
        BookingEntity entity = require(id);
        if (!STATUS_APPROVED.equalsIgnoreCase(entity.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La demande doit être validée par le chef de filière avant le cachet du doyen");
        }
        entity.setStatus(STATUS_CONFIRMED);
        entity.setDoyenComment(comment);
        entity.setUpdatedAt(LocalDateTime.now());
        entity.addHistory(STATUS_CONFIRMED, actor, "Cachet final apposé" + (comment == null || comment.isBlank() ? "" : " : " + comment));
        BookingEntity saved = bookingRepository.save(entity);

        double amount = resolvePrice(saved.getResource());
        boolean paid = paymentClient.processSimulatedPayment(saved.getId(), saved.getUsername(), amount);
        saved.setUpdatedAt(LocalDateTime.now());
        saved.addHistory("PAYMENT", "payment-service",
                paid ? "Paiement simulé effectué (" + amount + " MAD)" : "Paiement simulé indisponible");
        BookingEntity withPayment = bookingRepository.save(saved);

        notificationClient.sendWorkflowNotification(
                withPayment.getUsername(), null,
                "Félicitations ! Votre réservation #" + withPayment.getId() + " (" + withPayment.getResource()
                        + ", " + withPayment.getReservationDate() + ") est CONFIRMÉE par le doyen. "
                        + (paid ? "Paiement de " + amount + " MAD enregistré." : ""),
                "BOOKING_CONFIRMED", "/reservations");

        return toModel(withPayment);
    }

    @Transactional
    public Booking updateBooking(Long id, Booking updatedBooking, String requesterUsername, String requesterRole) {
        BookingEntity entity = require(id);

        boolean isOwner = entity.getUsername() != null && entity.getUsername().equals(requesterUsername);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(requesterRole);
        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez modifier que vos propres réservations");
        }
        if (!STATUS_PENDING.equalsIgnoreCase(entity.getStatus()) && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Impossible de modifier une demande déjà traitée");
        }

        LocalDate newDate = LocalDate.parse(updatedBooking.getDate());
        String newResource = updatedBooking.getResource();
        String newCreneau = updatedBooking.getCreneau() == null || updatedBooking.getCreneau().isBlank()
                ? entity.getCreneau()
                : updatedBooking.getCreneau();

        boolean changed = !newResource.equals(entity.getResource())
                || !newDate.equals(entity.getReservationDate())
                || !newCreneau.equals(entity.getCreneau());
        if (changed && bookingRepository.existsByResourceAndReservationDateAndCreneau(newResource, newDate, newCreneau)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Salle déjà réservée pour cette date et ce créneau");
        }

        entity.setResource(newResource);
        entity.setReservationDate(newDate);
        entity.setCreneau(newCreneau);
        if (updatedBooking.getMotif() != null) {
            entity.setMotif(updatedBooking.getMotif());
        }
        entity.setStatus(STATUS_PENDING);
        entity.setUpdatedAt(LocalDateTime.now());
        entity.addHistory(STATUS_PENDING, requesterUsername, "Demande modifiée");
        BookingEntity saved = bookingRepository.save(entity);

        notificationClient.sendWorkflowNotification(
                saved.getUsername(), null,
                "Votre demande #" + saved.getId() + " a été modifiée (retour en attente)",
                "BOOKING_UPDATED", "/reservations");

        return toModel(saved);
    }

    @Transactional
    public void cancelBooking(Long id, String requesterUsername, String requesterRole) {
        BookingEntity entity = require(id);

        boolean isOwner = entity.getUsername() != null && entity.getUsername().equals(requesterUsername);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(requesterRole);

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez annuler que vos propres réservations");
        }

        bookingRepository.delete(entity);

        notificationClient.sendWorkflowNotification(
                entity.getUsername(), null,
                "Votre réservation #" + entity.getId() + " a été annulée",
                "BOOKING_CANCELLED", "/reservations");
    }

    @Transactional
    public Booking attachDocument(Long id, String fileName, String contentType, byte[] data,
                                  String actor, String actorRole) {
        BookingEntity entity = require(id);
        boolean isOwner = userIsOwnerOrAdmin(entity, actor, actorRole);
        if (!isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seul le demandeur peut joindre un document");
        }
        entity.setDocumentName(fileName);
        entity.setDocumentType(contentType == null ? "application/pdf" : contentType);
        entity.setDocumentData(data);
        entity.setUpdatedAt(LocalDateTime.now());
        entity.addHistory("DOCUMENT", actor, "Document joint : " + fileName);
        return toModel(bookingRepository.save(entity));
    }

    public java.util.Optional<byte[]> getDocumentData(Long id) {
        return bookingRepository.findById(id)
                .filter(b -> b.getDocumentData() != null)
                .map(BookingEntity::getDocumentData);
    }

    public java.util.Optional<String> getDocumentName(Long id) {
        return bookingRepository.findById(id).map(BookingEntity::getDocumentName);
    }

    public java.util.Optional<String> getDocumentType(Long id) {
        return bookingRepository.findById(id).map(BookingEntity::getDocumentType);
    }

    private double resolvePrice(String resourceName) {
        return resourceRepository.findByNameIgnoreCase(resourceName)
                .map(r -> r.getPrice() == null ? 0.0 : r.getPrice())
                .orElse(0.0);
    }

    private BookingEntity require(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable"));
    }

    private boolean userIsOwnerOrAdmin(BookingEntity entity, String username, String role) {
        return (entity.getUsername() != null && entity.getUsername().equals(username))
                || "ADMIN".equalsIgnoreCase(role);
    }

    private Booking toModel(BookingEntity entity) {
        Booking b = new Booking(entity.getId(), entity.getResource(), entity.getReservationDate().toString(),
                entity.getStatus(), entity.getUsername());
        b.setCreneau(entity.getCreneau());
        b.setMotif(entity.getMotif());
        b.setFiliere(entity.getFiliere());
        b.setDocumentName(entity.getDocumentName());
        b.setHasDocument(entity.getDocumentData() != null && entity.getDocumentData().length > 0);
        b.setChefComment(entity.getChefComment());
        b.setDoyenComment(entity.getDoyenComment());
        b.setCreatedAt(entity.getCreatedAt() == null ? null : entity.getCreatedAt().toString());
        b.setUpdatedAt(entity.getUpdatedAt() == null ? null : entity.getUpdatedAt().toString());
        if (entity.getHistory() != null) {
            b.setHistory(entity.getHistory().stream()
                    .map(s -> new WorkflowStepDto(s.getStatus(), s.getActor(), s.getComment(), s.getTimestamp()))
                    .toList());
        }
        return b;
    }
}