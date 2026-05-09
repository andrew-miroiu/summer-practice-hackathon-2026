package com.andrei.springboot.service;

import org.springframework.stereotype.Service;

import com.andrei.springboot.dto.ConversationResponseDTO;

import java.util.UUID;

@Service
public interface ConversationService {
    ConversationResponseDTO createConversation(UUID userId, UUID participantId);
}