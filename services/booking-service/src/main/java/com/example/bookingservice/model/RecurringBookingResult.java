package com.example.bookingservice.model;

import java.util.List;

public class RecurringBookingResult {
    private List<Booking> created;
    private List<String> skippedDates;

    public RecurringBookingResult(List<Booking> created, List<String> skippedDates) {
        this.created = created;
        this.skippedDates = skippedDates;
    }

    public List<Booking> getCreated() { return created; }
    public List<String> getSkippedDates() { return skippedDates; }
}