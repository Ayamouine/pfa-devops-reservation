package com.example.authservice.model;

public class AuthResponse {
    private String token;
    private String refreshToken;
    private String username;
    private String role;

    public AuthResponse(String token, String refreshToken, String username, String role) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.role = role;
    }

    public String getToken() { return token; }
    public String getRefreshToken() { return refreshToken; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
}
