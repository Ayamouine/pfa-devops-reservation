package com.example.bookingservice.service;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.bookingservice.security.ServiceTokenProvider;

@Service
public class NotificationClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationClient.class);

    private final RestTemplate restTemplate;
    private final String notificationBaseUrl;
    private final ServiceTokenProvider serviceTokenProvider;

    public NotificationClient(RestTemplate restTemplate,
                              @Value("${notification.service.url:http://localhost:8083}") String notificationBaseUrl,
                              ServiceTokenProvider serviceTokenProvider) {
        this.restTemplate = restTemplate;
        this.notificationBaseUrl = notificationBaseUrl;
        this.serviceTokenProvider = serviceTokenProvider;
    }

    private HttpEntity<Map<String, String>> authorized(Map<String, String> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(serviceTokenProvider.token());
        return new HttpEntity<>(payload, headers);
    }

    public void sendReservationNotification(String username, String resource, String date, String status) {
        try {
            Map<String, String> payload = Map.of(
                    "username", username,
                    "message", "Reservation " + status + " for " + resource + " on " + date,
                    "status", status,
                    "type", "BOOKING_" + status.toUpperCase());
            restTemplate.postForObject(notificationBaseUrl + "/notifications", authorized(payload), Object.class);
        } catch (Exception e) {
            log.warn("Notification service unreachable: {}", e.getMessage());
        }
    }

    public void sendWorkflowNotification(String username, String target, String message, String type, String link) {
        try {
            Map<String, String> payload = new HashMap<>();
            if (username != null && !username.isBlank()) {
                payload.put("username", username);
            }
            if (target != null && !target.isBlank()) {
                payload.put("target", target);
            }
            payload.put("message", message);
            payload.put("type", type);
            if (link != null && !link.isBlank()) {
                payload.put("link", link);
            }
            restTemplate.postForObject(notificationBaseUrl + "/notifications", authorized(payload), Object.class);
        } catch (Exception e) {
            log.warn("Notification service unreachable (type={}, target={}): {}", type, target, e.getMessage());
        }
    }
}