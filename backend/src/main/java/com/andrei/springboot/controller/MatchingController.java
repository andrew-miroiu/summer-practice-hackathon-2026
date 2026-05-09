package com.andrei.springboot.controller;

import com.andrei.springboot.service.MatchingService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @GetMapping("/sport")
    public Map<String, Object> matchForSport(@RequestParam String sport) {
        return matchingService.matchForSport(sport);
    }

    @GetMapping("/all")
    public List<Map<String, Object>> matchAll() {
        return matchingService.matchAll();
    }
}