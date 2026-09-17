package com.example.bookingservice.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class WorkflowStep {

    @Column(nullable = false)
    private String status;

    @Column
    private String actor;

    @Column(length = 2048)
    private String comment;

    @Column
    private LocalDateTime timestamp;

    public WorkflowStep() {
    }

    public WorkflowStep(String status, String actor, String comment) {
        this.status = status;
        this.actor = actor;
        this.comment = comment;
        this.timestamp = LocalDateTime.now();
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}