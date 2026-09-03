package com.example.paymentservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.example.paymentservice.model.Payment;
import com.example.paymentservice.repository.PaymentRepository;

class PaymentServiceTest {

    private PaymentRepository paymentRepository;
    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentRepository = mock(PaymentRepository.class);
        // Skip the built-in seed data so tests only see what they set up themselves.
        when(paymentRepository.count()).thenReturn(1L);
        paymentService = new PaymentService(paymentRepository);
    }

    @Test
    void processPayment_forcesStatusToPaid_regardlessOfInput() {
        Payment incoming = new Payment(null, "42", 150.0, "pending", "aya");

        when(paymentRepository.save(any(Payment.class)))
                .thenAnswer(invocation -> {
                    Payment p = invocation.getArgument(0);
                    p.setId(5L);
                    return p;
                });

        Payment result = paymentService.processPayment(incoming);

        assertThat(result.getStatus()).isEqualTo("paid");
        assertThat(result.getId()).isEqualTo(5L);
    }

    @Test
    void processPayment_clearsAnyClientSuppliedId_beforeSaving() {
        Payment incoming = new Payment(999L, "42", 150.0, "pending", "aya");

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        when(paymentRepository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        paymentService.processPayment(incoming);

        assertThat(captor.getValue().getId()).isNull();
    }

    @Test
    void processPayment_preservesReservationIdAmountAndUsername() {
        Payment incoming = new Payment(null, "42", 150.0, "pending", "aya");

        ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
        when(paymentRepository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

        paymentService.processPayment(incoming);

        assertThat(captor.getValue().getReservationId()).isEqualTo("42");
        assertThat(captor.getValue().getAmount()).isEqualTo(150.0);
        assertThat(captor.getValue().getUsername()).isEqualTo("aya");
    }

    @Test
    void getPaymentsForUser_returnsOnlyThatUsersPayments() {
        Payment p1 = new Payment(1L, "10", 150.0, "paid", "aya");
        Payment p2 = new Payment(2L, "11", 150.0, "paid", "aya");
        when(paymentRepository.findByUsername("aya")).thenReturn(List.of(p1, p2));

        List<Payment> result = paymentService.getPaymentsForUser("aya");

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Payment::getUsername).containsOnly("aya");
    }

    @Test
    void getPayments_returnsEverythingInRepository() {
        Payment p1 = new Payment(1L, "10", 150.0, "paid", "aya");
        Payment p2 = new Payment(2L, "11", 150.0, "paid", "mouine");
        when(paymentRepository.findAll()).thenReturn(List.of(p1, p2));

        List<Payment> result = paymentService.getPayments();

        assertThat(result).hasSize(2);
    }
}