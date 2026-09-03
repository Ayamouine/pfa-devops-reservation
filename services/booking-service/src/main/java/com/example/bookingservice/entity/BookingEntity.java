package com.example.bookingservice.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "bookings", uniqueConstraints = @UniqueConstraint(columnNames = {"resource", "reservation_date"}))
public class BookingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String resource;

    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String username;

    public BookingEntity() {
    }

    public BookingEntity(String resource, LocalDate reservationDate, String status, String username) {
        this.resource = resource;
        this.reservationDate = reservationDate;
        this.status = status;
        this.username = username;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public LocalDate getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(LocalDate reservationDate) {
        this.reservationDate = reservationDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
