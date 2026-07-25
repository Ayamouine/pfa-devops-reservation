package com.example.notificationservice.service;

import com.example.notificationservice.model.Notification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    private final List<Notification> notifications = new ArrayList<>();

    public NotificationService() {
        notifications.add(new Notification(1L, "aya", "Rappel: réservation confirmée", "sent"));
        notifications.add(new Notification(2L, "mouine", "Rappel: réservation à venir", "pending"));
    }

    public List<Notification> getAllNotifications() {
        return notifications;
    }

    public Notification createNotification(String username, String message, String status) {
        Notification notification = new Notification((long) (notifications.size() + 1), username, message, status);
        notifications.add(notification);
        return notification;
    }

    public List<Notification> getNotificationsForUser(String username) {
        return notifications.stream()
                .filter(n -> username.equals(n.getUsername()))
                .collect(Collectors.toList());
    }
}
