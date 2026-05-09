package com.andrei.springboot.controller;

import com.andrei.springboot.model.Event;
import com.andrei.springboot.service.EventService;
import com.andrei.springboot.service.MatchingService;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    private final MatchingService matchingService;
    private final EventService eventService;

    public MatchingController(MatchingService matchingService, EventService eventService) {
        this.matchingService = matchingService;
        this.eventService = eventService;
    }

    @GetMapping("/sport")
    public Map<String, Object> matchForSport(@RequestParam String sport) {
        return matchingService.matchForSport(sport);
    }

    @GetMapping("/all")
    public List<Map<String, Object>> matchAll() {
        return matchingService.matchAll();
    }

    @GetMapping("/my")
    public List<Map<String, Object>> matchForCurrentUser() {
        return matchingService.matchForCurrentUser();
    }

    @PostMapping("/confirm")
    public Map<String, Object> confirmMatch(
            @RequestParam String sport,
            @RequestParam List<UUID> playerIds,
            @RequestParam UUID captainId) {
        Event event = eventService.createEventFromMatch(sport, playerIds, captainId);
        return Map.of("eventId", event.getId());
    }
}