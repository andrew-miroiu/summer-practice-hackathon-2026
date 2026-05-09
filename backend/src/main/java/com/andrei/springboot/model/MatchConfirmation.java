package com.andrei.springboot.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "match_confirmations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"profile_id", "sport", "confirmed_date"}))
public class MatchConfirmation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @Column(name = "sport", nullable = false)
    private String sport;

    @Column(name = "confirmed_date", nullable = false)
    private LocalDate confirmedDate;

    public MatchConfirmation() {}

    public MatchConfirmation(UUID profileId, String sport, LocalDate confirmedDate) {
        this.profileId = profileId;
        this.sport = sport;
        this.confirmedDate = confirmedDate;
    }

    public UUID getId() { return id; }
    public UUID getProfileId() { return profileId; }
    public void setProfileId(UUID profileId) { this.profileId = profileId; }
    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }
    public LocalDate getConfirmedDate() { return confirmedDate; }
    public void setConfirmedDate(LocalDate confirmedDate) { this.confirmedDate = confirmedDate; }
}
