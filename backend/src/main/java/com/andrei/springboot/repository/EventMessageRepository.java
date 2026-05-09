package com.andrei.springboot.repository;

import com.andrei.springboot.model.EventMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EventMessageRepository extends JpaRepository<EventMessage, UUID> {
    List<EventMessage> findByEventIdOrderByCreatedAtAsc(UUID eventId);
}