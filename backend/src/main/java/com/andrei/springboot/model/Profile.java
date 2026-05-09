package com.andrei.springboot.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "profiles_java")
public class Profile {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "description")
    private String description;

    @Column(name = "skill_level")
    private String skillLevel;

    @Column(name = "available_today")
    private Boolean availableToday = false;

    @Column(name = "city")
    private String city;

    @ElementCollection
    @CollectionTable(name = "profile_sports", joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "sport")
    private List<String> sportsPreferences = new ArrayList<>();

    public Profile() {}

    public Profile(UUID id, String username, String avatarUrl, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

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