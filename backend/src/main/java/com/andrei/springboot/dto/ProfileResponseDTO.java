package com.andrei.springboot.dto;

import java.util.*;
import java.time.LocalDateTime;

public class ProfileResponseDTO {
    private UUID id;
    private String username;
    private String avatarUrl;
    private LocalDateTime createdAt;

    public ProfileResponseDTO(UUID id, String username, String avatarUrl, LocalDateTime createdAt){
        this.id = id;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}