package com.andrei.springboot.service.impl;

import org.springframework.stereotype.Service;

import com.andrei.springboot.dto.ConversationResponseDTO;
import com.andrei.springboot.model.Conversation;
import com.andrei.springboot.repository.ConversationRepository;
import com.andrei.springboot.service.ConversationService;

import java.util.Optional;
import java.util.UUID;

@Service
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;

    public ConversationServiceImpl(ConversationRepository conversationRepository) {
        this.conversationRepository = conversationRepository;
    }

    @Override
    public ConversationResponseDTO createConversation(UUID userId, UUID participantId) {

        System.out.println("Creating conversation between " + userId + " and " + participantId);

        Optional<Conversation> conversationExists = conversationRepository.findByParticipant1IdAndParticipant2Id(userId, participantId);
        if(conversationExists.isPresent()) {
            return new ConversationResponseDTO(
                conversationExists.get().getId(), 
                conversationExists.get().getParticipant1Id(), 
                conversationExists.get().getParticipant2Id(),
                conversationExists.get().getCreatedAt()
            );
        }

        Optional<Conversation> conversationExistsReverse = conversationRepository.findByParticipant1IdAndParticipant2Id(participantId, userId);
        if(conversationExistsReverse.isPresent()) {
            return new ConversationResponseDTO(
                conversationExistsReverse.get().getId(), 
                conversationExistsReverse.get().getParticipant1Id(), 
                conversationExistsReverse.get().getParticipant2Id(),
                conversationExistsReverse.get().getCreatedAt()
            );
        }

        Conversation conversation = new Conversation(userId, participantId);
        Conversation savedConversation = conversationRepository.save(conversation);

        return new ConversationResponseDTO(
            savedConversation.getId(), 
            savedConversation.getParticipant1Id(), 
            savedConversation.getParticipant2Id(),
            savedConversation.getCreatedAt()
        );
    }
}