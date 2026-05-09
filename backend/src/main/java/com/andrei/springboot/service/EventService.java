package com.andrei.springboot.service;

import com.andrei.springboot.model.Event;
import com.andrei.springboot.model.EventMessage;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDate;

public interface EventService {
    List<Map<String, Object>> getTodaysEvents();
    Map<String, Object> getEventById(UUID id);
    Event createEvent(String sport, String location, Double latitude, Double longitude, LocalDateTime dateTime, Integer maxPlayers);
    void joinEvent(UUID eventId);
    EventMessage sendMessage(UUID eventId, String text);
    List<EventMessage> getMessages(UUID eventId);
    Event createEventFromMatch(String sport, List<UUID> playerIds, UUID captainId,
                               LocalDateTime dateTime, Double latitude, Double longitude, String location);
    List<Map<String, Object>> getEventsByDate(LocalDate date);
}