package com.example.notificationservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {

    @Id
    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private boolean remindersEnabled = true;

    @Column(nullable = false)
    private String channel = "INTERNE";

    public NotificationPreference() {}

    public NotificationPreference(String username, boolean remindersEnabled, String channel) {
        this.username = username;
        this.remindersEnabled = remindersEnabled;
        this.channel = channel;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public boolean isRemindersEnabled() { return remindersEnabled; }
    public void setRemindersEnabled(boolean remindersEnabled) { this.remindersEnabled = remindersEnabled; }
    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }
}