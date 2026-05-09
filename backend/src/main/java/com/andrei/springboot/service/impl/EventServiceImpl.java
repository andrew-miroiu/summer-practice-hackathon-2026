package com.andrei.springboot.service.impl;

import com.andrei.springboot.model.Event;
import com.andrei.springboot.model.EventMember;
import com.andrei.springboot.model.EventMessage;
import com.andrei.springboot.repository.EventMemberRepository;
import com.andrei.springboot.repository.EventMessageRepository;
import com.andrei.springboot.repository.EventRepository;
import com.andrei.springboot.repository.ProfileRepository;
import com.andrei.springboot.security.CustomUserDetails;
import com.andrei.springboot.service.EventService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.time.LocalDate;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventMemberRepository eventMemberRepository;
    private final EventMessageRepository eventMessageRepository;
    private final ProfileRepository profileRepository;

    public EventServiceImpl(EventRepository eventRepository,
                            EventMemberRepository eventMemberRepository,
                            EventMessageRepository eventMessageRepository,
                            ProfileRepository profileRepository) {
        this.eventRepository = eventRepository;
        this.eventMemberRepository = eventMemberRepository;
        this.eventMessageRepository = eventMessageRepository;
        this.profileRepository = profileRepository;
    }

    private UUID getCurrentUserId() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userDetails.getId();
    }

    @Override
    public List<Map<String, Object>> getTodaysEvents() {
        return getEventsByDate(LocalDate.now());
    }

    @Override
    public Map<String, Object> getEventById(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Event not found"));
        return enrichEvent(event);
    }

    private Map<String, Object> enrichEvent(Event event) {
        List<EventMember> members = eventMemberRepository.findByEventId(event.getId());
        long memberCount = members.size();

        List<Map<String, Object>> memberDetails = members.stream().map(m -> {
            var profile = profileRepository.findProfileById(m.getProfileId());
            Map<String, Object> map = new HashMap<>();
            map.put("id", m.getProfileId());
            map.put("username", profile != null ? profile.getUsername() : "Unknown");
            map.put("avatarUrl", profile != null ? profile.getAvatarUrl() : null);
            map.put("isCaptain", m.getIsCaptain());
            return map;
        }).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("id", event.getId());
        result.put("sport", event.getSport());
        result.put("location", event.getLocation());
        result.put("latitude", event.getLatitude());
        result.put("longitude", event.getLongitude());
        result.put("dateTime", event.getDateTime());
        result.put("maxPlayers", event.getMaxPlayers());
        result.put("currentPlayers", memberCount);
        result.put("createdBy", event.getCreatedBy());
        result.put("members", memberDetails);
        result.put("createdAt", event.getCreatedAt());
        return result;
    }

    @Override
    public Event createEvent(String sport, String location, Double latitude, Double longitude,
                             LocalDateTime dateTime, Integer maxPlayers) {
        UUID userId = getCurrentUserId();

        Event event = new Event();
        event.setSport(sport);
        event.setLocation(location);
        event.setLatitude(latitude);
        event.setLongitude(longitude);
        event.setDateTime(dateTime);
        event.setMaxPlayers(maxPlayers);
        event.setCreatedBy(userId);
        event.setCreatedAt(LocalDateTime.now());
        event.setIsCaptainAssigned(true);

        Event saved = eventRepository.save(event);

        EventMember captain = new EventMember(saved.getId(), userId, true);
        eventMemberRepository.save(captain);

        return saved;
    }

    @Override
    public void joinEvent(UUID eventId) {
        UUID userId = getCurrentUserId();

        if (eventMemberRepository.existsByEventIdAndProfileId(eventId, userId)) {
            throw new IllegalStateException("Already joined this event");
        }

        EventMember member = new EventMember(eventId, userId, false);
        eventMemberRepository.save(member);
    }

    @Override
    public EventMessage sendMessage(UUID eventId, String text) {
        UUID userId = getCurrentUserId();

        EventMessage message = new EventMessage();
        message.setEventId(eventId);
        message.setProfileId(userId);
        message.setText(text);
        message.setCreatedAt(LocalDateTime.now());

        return eventMessageRepository.save(message);
    }

    @Override
    public List<EventMessage> getMessages(UUID eventId) {
        return eventMessageRepository.findByEventIdOrderByCreatedAtAsc(eventId);
    }

    @Override
    public Event createEventFromMatch(String sport, List<UUID> playerIds, UUID captainId) {
        Event event = new Event();
        event.setSport(sport);
        event.setLocation("TBD");
        event.setDateTime(LocalDateTime.now().plusHours(2));
        event.setMaxPlayers(playerIds.size());
        event.setCreatedBy(captainId);
        event.setCreatedAt(LocalDateTime.now());
        event.setIsCaptainAssigned(true);

        Event saved = eventRepository.save(event);

        for (UUID playerId : playerIds) {
            EventMember member = new EventMember(saved.getId(), playerId, playerId.equals(captainId));
            eventMemberRepository.save(member);
        }

        return saved;
    }

    @Override
    public List<Map<String, Object>> getEventsByDate(LocalDate date) {
        List<Event> events = eventRepository.findEventsByDate(date);
        return events.stream().map(this::enrichEvent).toList();
    }
}