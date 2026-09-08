package com.example.bookingservice.service;

import com.example.bookingservice.model.Booking;
import com.example.bookingservice.repository.BookingRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class ConcurrentBookingIntegrationTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @AfterEach
    void cleanup() {
        bookingRepository.deleteAll();
    }

    @Test
    void concurrentCreates_resultInSingleBookingDueToDbConstraint() throws InterruptedException, ExecutionException {
        final String resource = "Salle Concur";
        final String date = "2026-10-01";

        Callable<Boolean> task = () -> {
            try {
                Booking b = new Booking(null, resource, date, null, "user1");
                bookingService.createBooking(b);
                return true;
            } catch (Exception e) {
                return false;
            }
        };

        ExecutorService ex = Executors.newFixedThreadPool(2);
        Future<Boolean> f1 = ex.submit(task);
        Future<Boolean> f2 = ex.submit(task);

        boolean r1 = f1.get();
        boolean r2 = f2.get();

        ex.shutdown();

        List<?> all = bookingRepository.findByResource(resource);
        assertThat(all.size()).isEqualTo(1);
        assertThat(r1 || r2).isTrue();
        assertThat(r1 && r2).isFalse();
    }
}
