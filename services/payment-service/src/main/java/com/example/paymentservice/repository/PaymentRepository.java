package com.example.paymentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.paymentservice.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    java.util.List<Payment> findByUsername(String username);
}