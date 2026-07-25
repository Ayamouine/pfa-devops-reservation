package com.example.notificationservice.controller;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.model.NotificationRequest;
import com.example.notificationservice.service.NotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Notification> notifications() {
        return notificationService.getAllNotifications();
    }

    @PostMapping
    public Notification createNotification(@RequestBody NotificationRequest request) {
        return notificationService.createNotification(request.getUsername(), request.getMessage(), request.getStatus());
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "notification-service", "status", "up");
    }

    @GetMapping("/user/{username}")
    public List<Notification> notificationsForUser(@PathVariable String username) {
        return notificationService.getNotificationsForUser(username);
    }
}
