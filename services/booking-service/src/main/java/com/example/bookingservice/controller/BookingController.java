package com.example.bookingservice.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.bookingservice.model.Booking;
import com.example.bookingservice.service.BookingService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://frontend:3000"})
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<Booking> bookings() {
        return bookingService.getAllBookings();
    }

    @GetMapping("/availability")
    public Map<String, Object> checkAvailability(@RequestParam String resource,
                                                 @RequestParam String date,
                                                 @RequestParam(required = false) String creneau) {
        boolean ok = (creneau == null || creneau.isBlank())
                ? bookingService.isAvailable(resource, java.time.LocalDate.parse(date))
                : bookingService.isAvailable(resource, java.time.LocalDate.parse(date), creneau);
        return Map.of("resource", resource, "date", date, "creneau", creneau == null ? "" : creneau, "available", ok);
    }

    @GetMapping("/calendar")
    public List<Booking> calendar(@RequestParam String from,
                                  @RequestParam String to,
                                  @RequestParam(required = false) String resource,
                                  @RequestParam(required = false) String filiere) {
        return bookingService.getCalendarBookings(
                java.time.LocalDate.parse(from), java.time.LocalDate.parse(to), resource, filiere);
    }

    @GetMapping("/availability/day")
    public Map<String, Object> availabilityForDay(@RequestParam String date) {
        java.time.LocalDate day = java.time.LocalDate.parse(date);
        return Map.of("date", date, "occupied", bookingService.getOccupiedResources(day));
    }

    @GetMapping("/mine")
    public List<Booking> myBookings(@RequestParam String username) {
        return bookingService.getBookingsForUser(username);
    }

    @GetMapping("/approvals")
    public List<Booking> approvals(HttpServletRequest request,
                                   @RequestParam(required = false) String type,
                                   @RequestParam(required = false) String filiere) {
        String role = attribute(request, "jwtRole", null);
        if ("DOYEN".equalsIgnoreCase(role)) {
            return bookingService.getBookingsForDoyen();
        }
        String resolvedFiliere = attribute(request, "jwtFiliere", filiere);
        if (resolvedFiliere == null || resolvedFiliere.isBlank()) {
            return List.of();
        }
        return bookingService.getBookingsForFiliere(resolvedFiliere);
    }

    @GetMapping("/{id}")
    public Booking booking(@PathVariable Long id) {
        return bookingService.getBooking(id);
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking, HttpServletRequest request) {
        String username = attribute(request, "jwtUsername", booking.getUsername());
        String role = attribute(request, "jwtRole", "USER");
        return ResponseEntity.ok(bookingService.createBooking(booking, username, role));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Booking> approveBooking(@PathVariable Long id,
                                                  @RequestParam(required = false) String comment,
                                                  HttpServletRequest request) {
        String actor = attribute(request, "jwtUsername", request.getParameter("actor"));
        String actorRole = attribute(request, "jwtRole", request.getParameter("role"));
        String actorFiliere = attribute(request, "jwtFiliere", request.getParameter("filiere"));
        return ResponseEntity.ok(bookingService.approveBooking(id, comment, actor, actorRole, actorFiliere));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Booking> rejectBooking(@PathVariable Long id,
                                                 @RequestParam(required = false) String comment,
                                                 HttpServletRequest request) {
        String actor = attribute(request, "jwtUsername", request.getParameter("actor"));
        String role = attribute(request, "jwtRole", request.getParameter("role"));
        return ResponseEntity.ok(bookingService.rejectBooking(id, comment, actor, role));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Booking> confirmBooking(@PathVariable Long id,
                                                  @RequestParam(required = false) String comment,
                                                  HttpServletRequest request) {
        String actor = attribute(request, "jwtUsername", request.getParameter("username"));
        String role = attribute(request, "jwtRole", request.getParameter("role"));
        return ResponseEntity.ok(bookingService.confirmBooking(id, comment, actor, role));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id,
                                                 @RequestBody Booking booking,
                                                 HttpServletRequest request) {
        String username = attribute(request, "jwtUsername", request.getParameter("username"));
        String role = attribute(request, "jwtRole", request.getParameter("role"));
        return ResponseEntity.ok(bookingService.updateBooking(id, booking, username, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id, HttpServletRequest request) {
        String username = attribute(request, "jwtUsername", request.getParameter("username"));
        String role = attribute(request, "jwtRole", request.getParameter("role"));
        bookingService.cancelBooking(id, username, role);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Booking> uploadDocument(@PathVariable Long id,
                                                  @RequestParam("file") MultipartFile file,
                                                  HttpServletRequest request) throws IOException {
        String actor = attribute(request, "jwtUsername", request.getParameter("username"));
        String role = attribute(request, "jwtRole", request.getParameter("role"));
        Booking updated = bookingService.attachDocument(
                id, file.getOriginalFilename(), file.getContentType(), file.getBytes(), actor, role);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        Optional<byte[]> data = bookingService.getDocumentData(id);
        if (data.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        String name = bookingService.getDocumentName(id).orElse("document.pdf");
        String type = bookingService.getDocumentType(id).orElse("application/pdf");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + name + "\"")
                .contentType(MediaType.parseMediaType(type))
                .body(data.get());
    }

    @GetMapping("/{id}/signed-document")
    public ResponseEntity<byte[]> downloadSignedDocument(@PathVariable Long id) {
        Optional<byte[]> data = bookingService.getSignedDocumentData(id);
        if (data.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        String name = bookingService.getSignedDocumentName(id).orElse("autorisation-evenement.pdf");
        String type = bookingService.getSignedDocumentType(id).orElse("application/pdf");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + name + "\"")
                .contentType(MediaType.parseMediaType(type))
                .body(data.get());
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "booking-service", "status", "up");
    }

    private String attribute(HttpServletRequest request, String name, String fallback) {
        Object attr = request.getAttribute(name);
        return attr == null ? fallback : String.valueOf(attr);
    }
}