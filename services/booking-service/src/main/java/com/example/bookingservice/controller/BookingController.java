package com.example.bookingservice.controller;

import com.example.bookingservice.model.Booking;
import com.example.bookingservice.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:3001")
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

    @GetMapping("/resources")
    public List<Map<String, String>> getResourceAvailability() {
        return bookingService.getAllBookings().stream()
                .filter(b -> !"cancelled".equalsIgnoreCase(b.getStatus()))
                .map(b -> Map.of("resource", b.getResource(), "date", b.getDate()))
                .collect(Collectors.toList());
    }

    @GetMapping("/mine")
    public List<Booking> myBookings(@RequestParam String username) {
        return bookingService.getBookingsForUser(username);
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        return ResponseEntity.ok(bookingService.createBooking(booking));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Booking> confirmBooking(
            @PathVariable Long id,
            @RequestParam String username,
            @RequestParam(defaultValue = "USER") String role) {
        return ResponseEntity.ok(bookingService.confirmBooking(id, username, role));
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable Long id,
            @RequestBody Booking booking,
            @RequestParam String username,
            @RequestParam(defaultValue = "USER") String role) {
        return ResponseEntity.ok(bookingService.updateBooking(id, booking, username, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Long id,
            @RequestParam String username,
            @RequestParam(defaultValue = "USER") String role) {
        bookingService.cancelBooking(id, username, role);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "booking-service", "status", "up");
    }
}