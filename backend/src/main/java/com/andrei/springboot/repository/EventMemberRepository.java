package com.andrei.springboot.repository;

import com.andrei.springboot.model.EventMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface EventMemberRepository extends JpaRepository<EventMember, UUID> {

    @Query("SELECT m FROM EventMember m WHERE m.id.eventId = :eventId")
    List<EventMember> findByEventId(@Param("eventId") UUID eventId);

    @Query("SELECT COUNT(m) > 0 FROM EventMember m WHERE m.id.eventId = :eventId AND m.id.profileId = :profileId")
    boolean existsByEventIdAndProfileId(@Param("eventId") UUID eventId, @Param("profileId") UUID profileId);

    @Query("SELECT COUNT(m) FROM EventMember m WHERE m.id.eventId = :eventId")
    long countByEventId(@Param("eventId") UUID eventId);
}