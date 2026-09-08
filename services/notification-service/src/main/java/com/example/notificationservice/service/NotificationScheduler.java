package com.example.notificationservice.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NotificationScheduler {

    private final NotificationService notificationService;

    public NotificationScheduler(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // runs every minute in demo; in production adjust cron
    @Scheduled(fixedDelayString = "PT1M")
    public void processPendingNotifications() {
        var pending = notificationService.getAllNotifications().stream()
                .filter(n -> "pending".equalsIgnoreCase(n.getStatus()))
                .toList();
        for (var n : pending) {
            // in production, send email/SMS; here we mark as sent
            n.setStatus("sent");
            notificationService.createNotification(n.getUsername(), "Auto-sent: " + n.getMessage(), "sent");
        }
    }
}
