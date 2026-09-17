package com.example.notificationservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.model.NotificationRequest;
import com.example.notificationservice.service.NotificationService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://frontend:3000"})
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
        return notificationService.createNotification(request);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "notification-service", "status", "up");
    }

    @GetMapping("/user/{username}")
    public List<Notification> notificationsForUser(@PathVariable String username) {
        return notificationService.getNotificationsForUser(username);
    }

    @GetMapping("/my")
    public List<Notification> myNotifications(HttpServletRequest request,
                                              @RequestParam(required = false) String username,
                                              @RequestParam(required = false) String role,
                                              @RequestParam(required = false) String filiere) {
        String resolvedUsername = attr(request, "jwtUsername", username);
        String resolvedRole = attr(request, "jwtRole", role);
        String resolvedFiliere = attr(request, "jwtFiliere", filiere);
        return notificationService.getMyNotifications(resolvedUsername, resolvedRole, resolvedFiliere);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(HttpServletRequest request) {
        String resolvedUsername = attr(request, "jwtUsername", request.getParameter("username"));
        String resolvedRole = attr(request, "jwtRole", request.getParameter("role"));
        String resolvedFiliere = attr(request, "jwtFiliere", request.getParameter("filiere"));
        long count = notificationService.countUnread(resolvedUsername, resolvedRole, resolvedFiliere);
        return Map.of("count", count);
    }

    @PatchMapping("/{id}/read")
    public Notification markRead(@PathVariable Long id, HttpServletRequest request) {
        String username = attr(request, "jwtUsername", request.getParameter("username"));
        return notificationService.markRead(id, username);
    }

    @PostMapping("/read-all")
    public Map<String, String> readAll(HttpServletRequest request,
                                       @RequestBody(required = false) Map<String, String> body) {
        String resolvedUsername = attr(request, "jwtUsername",
                body == null ? null : body.get("username"));
        String resolvedRole = attr(request, "jwtRole",
                body == null ? null : body.get("role"));
        String resolvedFiliere = attr(request, "jwtFiliere",
                body == null ? null : body.get("filiere"));
        notificationService.markAllRead(resolvedUsername, resolvedRole, resolvedFiliere);
        return Map.of("status", "ok");
    }

    private String attr(HttpServletRequest request, String name, String fallback) {
        Object value = request.getAttribute(name);
        return value == null ? fallback : String.valueOf(value);
    }
}