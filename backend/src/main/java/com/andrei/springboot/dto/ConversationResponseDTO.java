package com.andrei.springboot.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ConversationResponseDTO {

    private UUID id;
    private UUID participant1Id;
    private UUID participant2Id;
    private OffsetDateTime createdAt;

    public ConversationResponseDTO() {}

    public ConversationResponseDTO(UUID id, UUID participant1Id, UUID participant2Id, OffsetDateTime createdAt) {
        this.id = id;
        this.participant1Id = participant1Id;
        this.participant2Id = participant2Id;
        this.createdAt = createdAt;
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