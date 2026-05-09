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
    private String description;
    private String skillLevel;
    private Boolean availableToday;
    private List<String> sportsPreferences;
    private String city;

    public ProfilePageDTO(UUID id, String username, String avatarUrl, LocalDateTime createdAt,
                          String followersCount, String followingCount,
                          String description, String skillLevel, Boolean availableToday,
                          List<String> sportsPreferences, String city) {
        this.id = id;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
        this.followersCount = followersCount;
        this.followingCount = followingCount;
        this.description = description;
        this.skillLevel = skillLevel;
        this.availableToday = availableToday;
        this.sportsPreferences = sportsPreferences;
        this.city = city;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getFollowersCount() { return followersCount; }
    public void setFollowersCount(String followersCount) { this.followersCount = followersCount; }
    public String getFollowingCount() { return followingCount; }
    public void setFollowingCount(String followingCount) { this.followingCount = followingCount; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSkillLevel() { return skillLevel; }
    public void setSkillLevel(String skillLevel) { this.skillLevel = skillLevel; }
    public Boolean getAvailableToday() { return availableToday; }
    public void setAvailableToday(Boolean availableToday) { this.availableToday = availableToday; }
    public List<String> getSportsPreferences() { return sportsPreferences; }
    public void setSportsPreferences(List<String> sportsPreferences) { this.sportsPreferences = sportsPreferences; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}
