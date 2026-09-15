package com.example.authservice.model;

public class UpdateProfileRequest {
    private String newUsername;
    private String currentPassword;
    private String newPassword;
    private String avatarColor;

    public String getNewUsername() { return newUsername; }
    public void setNewUsername(String newUsername) { this.newUsername = newUsername; }
    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    public String getAvatarColor() { return avatarColor; }
    public void setAvatarColor(String avatarColor) { this.avatarColor = avatarColor; }
}