package com.example.authservice.model;

public class UserDto {
    private Long id;
    private String username;
    private String role;
    private String firstName;
    private String lastName;
    private String filiere;

    public UserDto(Long id, String username, String role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public UserDto(Long id, String username, String role, String firstName, String lastName, String filiere) {
        this(id, username, role);
        this.firstName = firstName;
        this.lastName = lastName;
        this.filiere = filiere;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getFiliere() { return filiere; }
}