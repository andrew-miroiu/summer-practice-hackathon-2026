package com.andrei.springboot.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PostResponseDTO {

    private UUID id;             // ID-ul postării
    private String text;         // textul postării
    private String imageUrl;     // URL imagine, dacă există
    private String videoUrl;     // URL video, dacă există
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    
    private String userId;       // ID-ul utilizatorului (din Supabase)
    private String username;     // username-ul utilizatorului (din Supabase)
    private String avatarUrl;    // avatar-ul utilizatorului (din Supabase)

    public PostResponseDTO(UUID id, String text, String imageUrl, String videoUrl,
                           OffsetDateTime createdAt, OffsetDateTime updatedAt,
                           String userId, String username, String avatarUrl) {
        this.id = id;
        this.text = text;
        this.imageUrl = imageUrl;
        this.videoUrl = videoUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
        this.username = username;
        this.avatarUrl = avatarUrl;
    }

    public UUID getId() { return id; }
    public String getText() { return text; }
    public String getImageUrl() { return imageUrl; }
    public String getVideoUrl() { return videoUrl; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public String getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getAvatarUrl() { return avatarUrl; }

    public void setId(UUID id) { this.id = id; }
    public void setText(String text) { this.text = text; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setUsername(String username) { this.username = username; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}