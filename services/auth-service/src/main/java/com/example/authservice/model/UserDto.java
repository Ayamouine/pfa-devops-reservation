package com.example.authservice.model;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String firstName;
    private String lastName;
    private String filiere;
    private String club;

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

    public UserDto(Long id, String username, String role, String firstName, String lastName, String filiere, String email) {
        this(id, username, role, firstName, lastName, filiere);
        this.email = email;
    }

    public UserDto(Long id, String username, String role, String firstName, String lastName, String filiere,
                   String email, String club) {
        this(id, username, role, firstName, lastName, filiere, email);
        this.club = club;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getFiliere() { return filiere; }
    public String getClub() { return club; }
}