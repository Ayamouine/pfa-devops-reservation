package com.example.bookingservice.service;

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
public class PaymentClient {

    private static final Logger log = LoggerFactory.getLogger(PaymentClient.class);

    private final RestTemplate restTemplate;
    private final String paymentBaseUrl;
    private final ServiceTokenProvider serviceTokenProvider;

    public PaymentClient(RestTemplate restTemplate,
                         @Value("${payment.service.url:http://localhost:8084}") String paymentBaseUrl,
                         ServiceTokenProvider serviceTokenProvider) {
        this.restTemplate = restTemplate;
        this.paymentBaseUrl = paymentBaseUrl;
        this.serviceTokenProvider = serviceTokenProvider;
    }

    public boolean processSimulatedPayment(Long bookingId, String username, double amount) {
        try {
            Map<String, Object> payload = Map.of(
                    "reservationId", String.valueOf(bookingId),
                    "username", username == null ? "guest" : username,
                    "amount", amount);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(serviceTokenProvider.token());
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            restTemplate.postForObject(paymentBaseUrl + "/payments", request, Map.class);
            return true;
        } catch (Exception e) {
            log.warn("Payment service unreachable; booking kept but payment not recorded (bookingId={}): {}",
                    bookingId, e.getMessage());
            return false;
        }
    }
}