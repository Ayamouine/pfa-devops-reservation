package com.example.notificationservice.service;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.model.NotificationRequest;
import com.example.notificationservice.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Notification createNotification(String username, String message, String status) {
        Notification n = new Notification(username, message,
                "SYSTEM", null, false, null);
        n.setStatus(status == null || status.isBlank() ? "sent" : status);
        return notificationRepository.save(n);
    }

    public Notification createNotification(NotificationRequest request) {
        Notification n = new Notification(
                request.getUsername(),
                request.getMessage() == null ? "" : request.getMessage(),
                request.getType(),
                request.getTarget(),
                false,
                request.getLink());
        n.setStatus(request.getStatus() == null || request.getStatus().isBlank() ? "sent" : request.getStatus());
        n.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(n);
    }

    public List<Notification> getNotificationsForUser(String username) {
        return notificationRepository.findByUsername(username);
    }

    public List<Notification> getMyNotifications(String username, String role, String filiere) {
        Set<Notification> result = new LinkedHashSet<>();
        result.addAll(notificationRepository.findByUsername(username));
        if (role != null && !role.isBlank()) {
            if ("DOYEN".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
                result.addAll(notificationRepository.findAll());
            } else {
                result.addAll(notificationRepository.findByTarget("ROLE:" + role.toUpperCase()));
            }
        }
        if (filiere != null && !filiere.isBlank()) {
            for (Notification n : notificationRepository.findByTarget("ROLE:CHEF_FILIERE:" + filiere)) {
                result.add(n);
            }
        }
        List<Notification> sorted = new ArrayList<>(result);
        sorted.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return sorted;
    }

    public long countUnread(String username, String role, String filiere) {
        return getMyNotifications(username, role, filiere).stream().filter(n -> !n.isRead()).count();
    }

    public Notification markRead(Long id, String username) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification introuvable"));
        if (n.getUsername() != null && !n.getUsername().isBlank() && !n.getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cette notification ne vous appartient pas");
        }
        n.setRead(true);
        return notificationRepository.save(n);
    }

    public void markAllRead(String username, String role, String filiere) {
        for (Notification n : getMyNotifications(username, role, filiere)) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }
}