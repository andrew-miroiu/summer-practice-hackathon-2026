package com.andrei.springboot.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "sport")
    private String sport;

    @Column(name = "location")
    private String location;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "date_time")
    private LocalDateTime dateTime;

    @Column(name = "max_players")
    private Integer maxPlayers;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "is_captain_assigned")
    private Boolean isCaptainAssigned = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Event() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
    public Integer getMaxPlayers() { return maxPlayers; }
    public void setMaxPlayers(Integer maxPlayers) { this.maxPlayers = maxPlayers; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    public Boolean getIsCaptainAssigned() { return isCaptainAssigned; }
    public void setIsCaptainAssigned(Boolean isCaptainAssigned) { this.isCaptainAssigned = isCaptainAssigned; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}