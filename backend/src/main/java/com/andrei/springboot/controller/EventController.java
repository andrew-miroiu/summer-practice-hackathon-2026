package com.andrei.springboot.controller;

import com.andrei.springboot.model.Event;
import com.andrei.springboot.model.EventMessage;
import com.andrei.springboot.service.EventService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<Map<String, Object>> getEvents(@RequestParam(required = false) String date) {
        if (date != null) {
            return eventService.getEventsByDate(LocalDate.parse(date));
        }
        return eventService.getTodaysEvents();
    }

    @GetMapping("/{id}")
    public Map<String, Object> getEventById(@PathVariable UUID id) {
        return eventService.getEventById(id);
    }

    @PostMapping
    public Event createEvent(
            @RequestParam String sport,
            @RequestParam String location,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam String dateTime,
            @RequestParam Integer maxPlayers) {
        return eventService.createEvent(sport, location, latitude, longitude,
                LocalDateTime.parse(dateTime), maxPlayers);
    }

    @PostMapping("/{id}/join")
    public void joinEvent(@PathVariable UUID id) {
        eventService.joinEvent(id);
    }

    @PostMapping("/{id}/messages")
    public EventMessage sendMessage(@PathVariable UUID id, @RequestParam String text) {
        return eventService.sendMessage(id, text);
    }

    @GetMapping("/{id}/messages")
    public List<EventMessage> getMessages(@PathVariable UUID id) {
        return eventService.getMessages(id);
    }
}