package com.andrei.springboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.andrei.springboot.model.Conversation;

import java.util.UUID;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    Optional<Conversation> findByParticipant1IdAndParticipant2Id(UUID participant1Id, UUID participant2Id);
}