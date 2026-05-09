package com.andrei.springboot.dto;

import java.util.*;
import java.time.LocalDateTime;

public class ProfilePageDTO {
    private UUID id;
    private String username;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private String followersCount;
    private String followingCount;

    public ProfilePageDTO(UUID id, String username, String avatarUrl, LocalDateTime createdAt, String followersCount, String followingCount  ){
        this.id = id;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
        this.followersCount = followersCount;
        this.followingCount = followingCount;
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

    public String getFollowersCount() {
        return followersCount;
    }

    public void setFollowersCount(String followersCount) {
        this.followersCount = followersCount;
    }

    public String getFollowingCount() {
        return followingCount;
    }

    public void setFollowingCount(String followingCount) {
        this.followingCount = followingCount;
    }

}