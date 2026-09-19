package com.example.authservice.model;

public record OtpRequest(String emailOrUsername, String purpose) {
}
