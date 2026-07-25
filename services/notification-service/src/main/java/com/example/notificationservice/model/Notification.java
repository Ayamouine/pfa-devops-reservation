package com.example.notificationservice.model;

public class Notification {
    private Long id;
    private String username;
    private String message;
    private String status;

    public Notification() {}

    public Notification(Long id, String username, String message, String status) {
        this.id = id;
        this.username = username;
        this.message = message;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
