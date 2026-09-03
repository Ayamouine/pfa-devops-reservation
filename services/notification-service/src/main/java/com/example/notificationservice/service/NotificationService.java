package com.example.notificationservice.service;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
        if (notificationRepository.count() == 0) {
            notificationRepository.save(new Notification("aya", "Rappel: reservation confirmee", "sent"));
            notificationRepository.save(new Notification("mouine", "Rappel: reservation a venir", "pending"));
        }
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Notification createNotification(String username, String message, String status) {
        return notificationRepository.save(new Notification(username, message, status));
    }

    public List<Notification> getNotificationsForUser(String username) {
        return notificationRepository.findByUsername(username);
    }
}
