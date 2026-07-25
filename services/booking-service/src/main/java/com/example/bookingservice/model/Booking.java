package com.example.bookingservice.model;

public class Booking {
    private Long id;
    private String resource;
    private String date;
    private String status;

    public Booking() {}

    public Booking(Long id, String resource, String date, String status) {
        this.id = id;
        this.resource = resource;
        this.date = date;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getResource() { return resource; }
    public void setResource(String resource) { this.resource = resource; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
