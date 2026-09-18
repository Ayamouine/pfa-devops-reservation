package com.example.bookingservice.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "bookings",
        uniqueConstraints = @UniqueConstraint(columnNames = {"resource", "reservation_date", "creneau"}))
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

    @Column
    private String creneau;

    @Column(length = 2048)
    private String motif;

    @Column
    private String filiere;

    @Column(name = "booking_type")
    private String bookingType = "RESERVATION";

    @Column
    private String club;

    @Column(name = "signed_document_name")
    private String signedDocumentName;

    @Column(name = "signed_document_type")
    private String signedDocumentType;

    @Lob
    @Column(name = "signed_document_data", columnDefinition = "LONGBLOB")
    private byte[] signedDocumentData;

    @Column(name = "document_name")
    private String documentName;

    @Column(name = "document_type")
    private String documentType;

    @Lob
    @Column(name = "document_data", columnDefinition = "LONGBLOB")
    private byte[] documentData;

    @Column(name = "chef_comment", length = 2048)
    private String chefComment;

    @Column(name = "doyen_comment", length = 2048)
    private String doyenComment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "booking_status_history", joinColumns = @JoinColumn(name = "booking_id"))
    private List<WorkflowStep> history = new ArrayList<>();

    public BookingEntity() {
    }

    public BookingEntity(String resource, LocalDate reservationDate, String status, String username) {
        this.resource = resource;
        this.reservationDate = reservationDate;
        this.status = status;
        this.username = username;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getResource() { return resource; }
    public void setResource(String resource) { this.resource = resource; }
    public LocalDate getReservationDate() { return reservationDate; }
    public void setReservationDate(LocalDate reservationDate) { this.reservationDate = reservationDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getCreneau() { return creneau; }
    public void setCreneau(String creneau) { this.creneau = creneau; }
    public String getMotif() { return motif; }
    public void setMotif(String motif) { this.motif = motif; }
    public String getFiliere() { return filiere; }
    public void setFiliere(String filiere) { this.filiere = filiere; }
    public String getBookingType() { return bookingType; }
    public void setBookingType(String bookingType) { this.bookingType = bookingType; }
    public String getClub() { return club; }
    public void setClub(String club) { this.club = club; }
    public String getSignedDocumentName() { return signedDocumentName; }
    public void setSignedDocumentName(String signedDocumentName) { this.signedDocumentName = signedDocumentName; }
    public String getSignedDocumentType() { return signedDocumentType; }
    public void setSignedDocumentType(String signedDocumentType) { this.signedDocumentType = signedDocumentType; }
    public byte[] getSignedDocumentData() { return signedDocumentData; }
    public void setSignedDocumentData(byte[] signedDocumentData) { this.signedDocumentData = signedDocumentData; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public byte[] getDocumentData() { return documentData; }
    public void setDocumentData(byte[] documentData) { this.documentData = documentData; }
    public String getChefComment() { return chefComment; }
    public void setChefComment(String chefComment) { this.chefComment = chefComment; }
    public String getDoyenComment() { return doyenComment; }
    public void setDoyenComment(String doyenComment) { this.doyenComment = doyenComment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<WorkflowStep> getHistory() { return history; }
    public void setHistory(List<WorkflowStep> history) { this.history = history; }
    public void addHistory(String status, String actor, String comment) {
        this.history.add(new WorkflowStep(status, actor, comment));
    }
}