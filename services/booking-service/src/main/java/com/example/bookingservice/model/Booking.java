package com.example.bookingservice.model;

import java.util.List;

public class Booking {
    private Long id;
    private String resource;
    private String date;
    private String status;
    private String username;
    private String creneau;
    private String motif;
    private String filiere;
    private String documentName;
    private boolean hasDocument;
    private String chefComment;
    private String doyenComment;
    private String createdAt;
    private String updatedAt;
    private List<WorkflowStepDto> history;

    public Booking() {}

    public Booking(Long id, String resource, String date, String status, String username) {
        this.id = id;
        this.resource = resource;
        this.date = date;
        this.status = status;
        this.username = username;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getResource() { return resource; }
    public void setResource(String resource) { this.resource = resource; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getCreneau() { return creneau; }
    public void setCreneau(String creneau) { this.creneau = creneau; }
    public String getMotif() { return motif; }
    public void setMotif(String motif) { this.motif = motif; }
    public String getFiliere() { return filiere; }
    public void setFiliere(String filiere) { this.filiere = filiere; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public boolean isHasDocument() { return hasDocument; }
    public void setHasDocument(boolean hasDocument) { this.hasDocument = hasDocument; }
    public String getChefComment() { return chefComment; }
    public void setChefComment(String chefComment) { this.chefComment = chefComment; }
    public String getDoyenComment() { return doyenComment; }
    public void setDoyenComment(String doyenComment) { this.doyenComment = doyenComment; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    public List<WorkflowStepDto> getHistory() { return history; }
    public void setHistory(List<WorkflowStepDto> history) { this.history = history; }
}