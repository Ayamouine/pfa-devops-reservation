package com.example.paymentservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.paymentservice.model.Payment;
import com.example.paymentservice.service.PaymentService;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
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
    public List<Payment> myPayments(@RequestParam String username) {
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

    @GetMapping("/{id}/invoice")
    public org.springframework.http.ResponseEntity<String> invoice(@org.springframework.web.bind.annotation.PathVariable Long id) {
        var opt = paymentService.getPaymentById(id);
        if (opt.isEmpty()) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
        Payment p = opt.get();
        String html = "<html><head><meta charset=\"utf-8\"><title>Invoice #"+p.getId()+"</title></head><body>" +
                "<h1>Invoice for reservation " + p.getReservationId() + "</h1>" +
                "<p>User: " + p.getUsername() + "</p>" +
                "<p>Amount: " + String.format("%.2f", p.getAmount()) + " EUR</p>" +
                "<p>Status: " + p.getStatus() + "</p>" +
                "</body></html>";
        return org.springframework.http.ResponseEntity.ok()
                .header("Content-Type", "text/html; charset=utf-8")
                .body(html);
    }
}