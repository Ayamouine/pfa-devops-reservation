package com.example.paymentservice.controller;

import com.example.paymentservice.model.Payment;
import com.example.paymentservice.service.PaymentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3001")
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<Payment> payments() {
        return paymentService.getPayments();
    }

    @GetMapping("/mine")
    public List<Payment> myPayments(@org.springframework.web.bind.annotation.RequestParam String username) {
        return paymentService.getPaymentsForUser(username);
    }

    @PostMapping
    public Payment pay(@RequestBody Payment payment) {
        return paymentService.processPayment(payment);
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("service", "payment-service", "status", "up");
    }
}