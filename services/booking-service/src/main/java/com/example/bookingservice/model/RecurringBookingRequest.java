package com.example.bookingservice.model;

public class RecurringBookingRequest {
    private String resource;
    private String date;
    private String username;
    private int occurrences;

    public String getResource() { return resource; }
    public void setResource(String resource) { this.resource = resource; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public int getOccurrences() { return occurrences; }
    public void setOccurrences(int occurrences) { this.occurrences = occurrences; }
}