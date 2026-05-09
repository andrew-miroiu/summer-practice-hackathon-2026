package com.andrei.springboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.andrei.springboot.model.Message;
import java.util.UUID;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, UUID> {
        List<Message> findByConversation_IdOrderByCreatedAtAsc(UUID conversationId);
}