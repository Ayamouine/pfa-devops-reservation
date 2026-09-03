package com.example.paymentservice.service;

import com.example.paymentservice.model.Payment;
import com.example.paymentservice.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
        if (paymentRepository.count() == 0) {
            paymentRepository.save(new Payment(null, "1", 150.0, "paid", "aya"));
        }
    }

    public List<Payment> getPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsForUser(String username) {
        return paymentRepository.findByUsername(username);
    }

    public Payment processPayment(Payment payment) {
        payment.setId(null);
        payment.setStatus("paid");
        return paymentRepository.save(payment);
    }
}