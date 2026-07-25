package com.example.paymentservice.service;

import com.example.paymentservice.model.Payment;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {
    private final List<Payment> payments = new ArrayList<>();

    public PaymentService() {
        payments.add(new Payment(1L, "1", 150.0, "paid"));
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public Payment processPayment(Payment payment) {
        payment.setId((long) (payments.size() + 1));
        payment.setStatus("paid");
        payments.add(payment);
        return payment;
    }
}
