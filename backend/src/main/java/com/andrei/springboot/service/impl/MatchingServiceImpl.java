package com.andrei.springboot.service.impl;

import com.andrei.springboot.model.Profile;
import com.andrei.springboot.repository.ProfileRepository;
import com.andrei.springboot.security.CustomUserDetails;
import com.andrei.springboot.service.MatchingService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.UUID;

@Service
public class MatchingServiceImpl implements MatchingService {

    private final ProfileRepository profileRepository;

    public MatchingServiceImpl(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    private static final Map<String, int[]> SPORT_GROUP_SIZE = Map.of(
        "Football", new int[]{10, 14},
        "Basketball", new int[]{6, 10},
        "Tennis", new int[]{2, 4},
        "Volleyball", new int[]{6, 12},
        "Running", new int[]{2, 10},
        "Cycling", new int[]{2, 10},
        "Swimming", new int[]{2, 8},
        "Badminton", new int[]{2, 4}
    );

    @Override
    public Map<String, Object> matchForSport(String sport) {
        List<Profile> available = profileRepository.findAvailableProfilesBySport(sport);

        if (available.isEmpty()) {
            return Map.of("sport", sport, "message", "No available players", "players", List.of());
        }

        Collections.shuffle(available);

        int[] range = SPORT_GROUP_SIZE.getOrDefault(sport, new int[]{2, 10});
        int groupSize = Math.min(available.size(), range[1]);
        List<Profile> group = available.subList(0, groupSize);

        Profile captain = group.get(new Random().nextInt(group.size()));

        List<Map<String, Object>> players = group.stream().map(p -> {
            Map<String, Object> player = new HashMap<>();
            player.put("id", p.getId());
            player.put("username", p.getUsername());
            player.put("avatarUrl", p.getAvatarUrl());
            player.put("skillLevel", p.getSkillLevel());
            player.put("isCaptain", p.getId().equals(captain.getId()));
            return player;
        }).toList();

        return Map.of(
            "sport", sport,
            "totalPlayers", group.size(),
            "minRequired", range[0],
            "captain", Map.of("id", captain.getId(), "username", captain.getUsername()),
            "players", players,
            "readyToPlay", group.size() >= range[0]
        );
    }

    @Override
    public List<Map<String, Object>> matchForCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID userId = userDetails.getId();
        Profile profile = profileRepository.findProfileById(userId);
        List<String> userSports = profile.getSportsPreferences();
        List<Map<String, Object>> results = new ArrayList<>();
        for (String sport : userSports) {
            Map<String, Object> match = matchForSport(sport);
            List<?> players = (List<?>) match.get("players");
            if (!players.isEmpty()) {
                results.add(match);
            }
        }
        return results;
    }

    @Override
    public List<Map<String, Object>> matchAll() {
        List<Map<String, Object>> results = new ArrayList<>();
        for (String sport : SPORT_GROUP_SIZE.keySet()) {
            Map<String, Object> match = matchForSport(sport);
            List<?> players = (List<?>) match.get("players");
            if (!players.isEmpty()) {
                results.add(match);
            }
        }
        return results;
    }
}