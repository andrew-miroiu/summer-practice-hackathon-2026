package com.andrei.springboot.service;

import org.springframework.stereotype.Service;

import com.andrei.springboot.dto.MessageResponseDTO;
import java.util.List;
import java.util.UUID;

@Service
public interface MessageService {
    List<MessageResponseDTO> getMessagesByConversationId(UUID conversationId);
    MessageResponseDTO sendMessage(UUID conversationId, UUID senderId, String content);
}