package com.andrei.springboot.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class MessageResponseDTO {

    private UUID id;
    private UUID conversationId;
    private UUID senderId;
    private String content;
    private OffsetDateTime createdAt;

    public MessageResponseDTO() {}

    public MessageResponseDTO(UUID id, UUID conversationId, UUID senderId, String content, OffsetDateTime createdAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.content = content;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getConversationId() {
        return conversationId;
    }

    public UUID getSenderId() {
        return senderId;
    }

    public String getContent() {
        return content;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setConversationId(UUID conversationId) {
        this.conversationId = conversationId;
    }

    public void setSenderId(UUID senderId) {
        this.senderId = senderId;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}