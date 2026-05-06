package com.logistics.shipment_tracker.dto.response;

import com.logistics.shipment_tracker.enums.Role;

import java.util.UUID;

public class AuthResponse {

    private String token;
    private UUID userId;
    private String username;
    private String email;
    private Role role;

    public AuthResponse() {
    }

    public AuthResponse(String token, UUID userId, String username, String email, Role role) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}