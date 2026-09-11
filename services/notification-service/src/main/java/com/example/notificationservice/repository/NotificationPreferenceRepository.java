package com.example.notificationservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.notificationservice.entity.NotificationPreference;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, String> {
}