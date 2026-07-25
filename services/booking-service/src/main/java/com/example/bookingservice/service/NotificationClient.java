package com.example.bookingservice.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NotificationClient {

    private final RestTemplate restTemplate;
    private final String notificationBaseUrl;

    public NotificationClient(RestTemplate restTemplate,
                              @Value("${notification.service.url:http://localhost:8083}") String notificationBaseUrl) {
        this.restTemplate = restTemplate;
        this.notificationBaseUrl = notificationBaseUrl;
    }

    public void sendReservationNotification(String username, String resource, String date, String status) {
        Map<String, String> payload = Map.of(
                "username", username,
                "message", "Reservation confirmed for " + resource + " on " + date,
                "status", status);
        restTemplate.postForObject(notificationBaseUrl + "/notifications", payload, Object.class);
    }
}
