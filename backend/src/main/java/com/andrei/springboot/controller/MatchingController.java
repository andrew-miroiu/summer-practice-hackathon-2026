package com.andrei.springboot.controller;

import com.andrei.springboot.model.Event;
import com.andrei.springboot.service.EventService;
import com.andrei.springboot.service.MatchingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    @PostMapping("/confirm-player")
    public Map<String, Object> confirmPlayer(@RequestParam String sport) {
        matchingService.confirmPlayer(sport);
        return Map.of("status", "confirmed");
    }

    @PostMapping("/confirm")
    public Map<String, Object> confirmMatch(
            @RequestParam String sport,
            @RequestParam List<UUID> playerIds,
            @RequestParam UUID captainId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTime,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "TBD") String location) {
        Event event = eventService.createEventFromMatch(sport, playerIds, captainId, dateTime, latitude, longitude, location);
        return Map.of("eventId", event.getId());
    }
}
