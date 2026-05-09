package com.andrei.springboot.model;

import java.time.OffsetDateTime;
import java.util.UUID;
import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "conversations")
public class Conversation {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
        name = "UUID",
        strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(name = "id")
    private UUID id;

    @Column(name = "participant1_id")
    private UUID participant1Id;

    @Column(name = "participant2_id")
    UUID participant2Id;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    public Conversation() {}

    public Conversation(UUID participant1Id, UUID participant2Id) {
        this.participant1Id = participant1Id;
        this.participant2Id = participant2Id;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getParticipant1Id() {
        return participant1Id;
    }

    public void setParticipant1Id(UUID participant1Id) {
        this.participant1Id = participant1Id;
    }

    public UUID getParticipant2Id() {
        return participant2Id;
    }

    public void setParticipant2Id(UUID participant2Id) {
        this.participant2Id = participant2Id;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}