package com.example.authservice.model;

public class AuthResponse {
    private Long id;
    private String token;
    private String refreshToken;
    private String username;
    private String role;
    private String firstName;
    private String lastName;
    private String filiere;
    private String avatarColor;

    public AuthResponse(String token, String refreshToken, String username, String role) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.role = role;
    }

    public AuthResponse(String token, String refreshToken, String username, String role,
                        String firstName, String lastName, String filiere) {
        this(token, refreshToken, username, role);
        this.firstName = firstName;
        this.lastName = lastName;
        this.filiere = filiere;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getToken() { return token; }
    public String getRefreshToken() { return refreshToken; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getFiliere() { return filiere; }
    public String getAvatarColor() { return avatarColor; }
    public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }
}