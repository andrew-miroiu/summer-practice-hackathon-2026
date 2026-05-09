package com.andrei.springboot.dto;

import java.util.UUID;

public class CreateConversationRequestDTO {
    
    private UUID participantId;

    public CreateConversationRequestDTO() {}

    public UUID getParticipantId() {
        return participantId;
    }

    public void setParticipantId(UUID participantId) {
        this.participantId = participantId;
    }
}