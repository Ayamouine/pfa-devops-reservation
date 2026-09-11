package com.example.notificationservice.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.notificationservice.entity.NotificationPreference;
import com.example.notificationservice.repository.NotificationPreferenceRepository;

@RestController
@CrossOrigin(origins = "http://localhost:3001")
@RequestMapping("/notifications/preferences")
public class NotificationPreferenceController {

    private final NotificationPreferenceRepository repository;

    public NotificationPreferenceController(NotificationPreferenceRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/{username}")
    public NotificationPreference get(@PathVariable String username) {
        return repository.findById(username)
                .orElse(new NotificationPreference(username, true, "INTERNE"));
    }

    @PutMapping("/{username}")
    public NotificationPreference update(@PathVariable String username, @RequestBody NotificationPreference body) {
        NotificationPreference pref = repository.findById(username)
                .orElse(new NotificationPreference(username, true, "INTERNE"));
        pref.setUsername(username);
        pref.setRemindersEnabled(body.isRemindersEnabled());
        pref.setChannel(body.getChannel());
        return repository.save(pref);
    }
}