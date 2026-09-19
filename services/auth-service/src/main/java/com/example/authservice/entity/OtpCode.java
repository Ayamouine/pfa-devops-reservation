package com.example.authservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_codes", indexes = {
    @Index(name = "idx_otp_owner_purpose", columnList = "owner,purpose,used")
})
public class OtpCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String owner;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(nullable = false, length = 30)
    private String purpose;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    @Column(nullable = false)
    private int attempts = 0;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    protected OtpCode() {
    }

    public OtpCode(String owner, String code, String purpose, LocalDateTime expiresAt) {
        this.owner = owner;
        this.code = code;
        this.purpose = purpose;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isExhausted() {
        return attempts >= 5;
    }

    public void incrementAttempts() {
        this.attempts++;
    }

    public void markUsed() {
        this.used = true;
        this.usedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getOwner() { return owner; }
    public String getCode() { return code; }
    public String getPurpose() { return purpose; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isUsed() { return used; }
    public int getAttempts() { return attempts; }
    public LocalDateTime getUsedAt() { return usedAt; }
}
