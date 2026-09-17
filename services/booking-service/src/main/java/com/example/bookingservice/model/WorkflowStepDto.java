package com.example.bookingservice.model;

import java.time.LocalDateTime;

public class WorkflowStepDto {
    private String status;
    private String actor;
    private String comment;
    private LocalDateTime timestamp;

    public WorkflowStepDto() {
    }

    public WorkflowStepDto(String status, String actor, String comment, LocalDateTime timestamp) {
        this.status = status;
        this.actor = actor;
        this.comment = comment;
        this.timestamp = timestamp;
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