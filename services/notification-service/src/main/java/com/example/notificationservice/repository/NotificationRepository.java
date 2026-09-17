package com.example.notificationservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.notificationservice.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUsername(String username);
    List<Notification> findByTarget(String target);
    List<Notification> findByUsernameAndReadFalse(String username);
    long countByUsernameAndReadFalse(String username);
}