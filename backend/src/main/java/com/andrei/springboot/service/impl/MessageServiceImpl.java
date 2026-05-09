package com.andrei.springboot.service.impl;

import java.util.UUID;
import java.util.List;

import org.springframework.stereotype.Service;
import com.andrei.springboot.dto.MessageResponseDTO;
import com.andrei.springboot.model.Message;
import com.andrei.springboot.repository.MessageRepository;
import com.andrei.springboot.service.MessageService;
import com.andrei.springboot.model.Conversation;
import com.andrei.springboot.repository.ConversationRepository;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;

    public MessageServiceImpl(MessageRepository messageRepository, ConversationRepository conversationRepository){
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
    }

    @Override
    public List<MessageResponseDTO> getMessagesByConversationId(UUID conversationId) {
        List<Message> messages = messageRepository.findByConversation_IdOrderByCreatedAtAsc(conversationId);

        return messages.stream()
                .map(message -> new MessageResponseDTO(
                        message.getId(),
                        message.getConversation().getId(),
                        message.getSenderId(),
                        message.getContent(),
                        message.getCreatedAt()
                ))
                .toList();
    }

    @Override
    public MessageResponseDTO sendMessage(UUID conversationId, UUID senderId, String content) {
        
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        Message message = new Message(conversation, senderId, content);
        Message savedMessage = messageRepository.save(message);

        return new MessageResponseDTO(
                savedMessage.getId(),
                savedMessage.getConversation().getId(),
                savedMessage.getSenderId(),
                savedMessage.getContent(),
                savedMessage.getCreatedAt()
        );
    }
}