package com.example.notificationservice.model;

public class NotificationRequest {
    private String username;
    private String message;
    private String status;
    private String type;
    private String target;
    private String link;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }
    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }
}