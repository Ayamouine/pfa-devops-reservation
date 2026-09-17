package com.example.notificationservice.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    @Column(length = 2048)
    private String message;
    private String type;
    private String target;
    private String status;
    @Column(name = "is_read")
    private boolean read;
    @Column
    private String link;
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Notification() {}

    public Notification(Long id, String username, String message, String status) {
        this.id = id;
        this.username = username;
        this.message = message;
        this.status = status;
        this.type = "SYSTEM";
        this.read = false;
        this.createdAt = LocalDateTime.now();
    }

    public Notification(String username, String message, String status) {
        this(null, username, message, status);
    }

    public Notification(String username, String message, String type, String target, boolean read, String link) {
        this.username = username;
        this.message = message;
        this.type = type == null ? "SYSTEM" : type;
        this.target = target;
        this.read = read;
        this.link = link;
        this.status = "sent";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}