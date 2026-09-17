package com.example.authservice.model;

public class RoleUpdateRequest {
    private String role;
    private String filiere;
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getFiliere() { return filiere; }
    public void setFiliere(String filiere) { this.filiere = filiere; }
}