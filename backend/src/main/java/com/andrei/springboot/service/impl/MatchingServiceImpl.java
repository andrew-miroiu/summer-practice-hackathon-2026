package com.andrei.springboot.service.impl;

import com.andrei.springboot.model.MatchConfirmation;
import com.andrei.springboot.model.Profile;
import com.andrei.springboot.repository.MatchConfirmationRepository;
import com.andrei.springboot.repository.ProfileRepository;
import com.andrei.springboot.security.CustomUserDetails;
import com.andrei.springboot.service.MatchingService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class MatchingServiceImpl implements MatchingService {

    private final ProfileRepository profileRepository;
    private final MatchConfirmationRepository matchConfirmationRepository;

    public MatchingServiceImpl(ProfileRepository profileRepository,
                               MatchConfirmationRepository matchConfirmationRepository) {
        this.profileRepository = profileRepository;
        this.matchConfirmationRepository = matchConfirmationRepository;
    }

    private static final Map<String, int[]> SPORT_GROUP_SIZE = Map.of(
        "Football",   new int[]{10, 14},
        "Basketball", new int[]{6,  10},
        "Tennis",     new int[]{2,   4},
        "Volleyball", new int[]{6,  12},
        "Running",    new int[]{2,  10},
        "Cycling",    new int[]{2,  10},
        "Swimming",   new int[]{2,   8},
        "Badminton",  new int[]{2,   4}
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
            player.put("isConfirmed", false);
            return player;
        }).toList();
        return Map.of(
            "sport", sport,
            "totalPlayers", group.size(),
            "minRequired", range[0],
            "captain", Map.of("id", captain.getId(), "username", captain.getUsername()),
            "players", players,
            "readyToPlay", group.size() >= range[0],
            "confirmedCount", 0,
            "currentUserConfirmed", false
        );
    }

    @Override
    public List<Map<String, Object>> matchForCurrentUser() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID userId = userDetails.getId();
        Profile profile = profileRepository.findProfileById(userId);
        List<String> userSports = profile.getSportsPreferences();

        List<Map<String, Object>> results = new ArrayList<>();
        LocalDate today = LocalDate.now();

        String currentUserCity = profile.getCity();

        for (String sport : userSports) {
            List<Profile> available = profileRepository.findAvailableProfilesBySport(sport);
            if (available.isEmpty()) continue;

            // Filter by city if the current user has one set
            if (currentUserCity != null && !currentUserCity.isBlank()) {
                available = available.stream()
                    .filter(p -> currentUserCity.equalsIgnoreCase(p.getCity()))
                    .collect(java.util.stream.Collectors.toList());
                if (available.isEmpty()) continue;
            }

            // Deterministic shuffle seeded by date + sport so groups are stable all day
            long seed = today.toEpochDay() * 31L + sport.hashCode();
            List<Profile> shuffled = new ArrayList<>(available);
            Collections.shuffle(shuffled, new Random(seed));

            int[] range = SPORT_GROUP_SIZE.getOrDefault(sport, new int[]{2, 10});
            int groupSize = range[1];

            // Find which group slot the current user falls into
            int userIndex = -1;
            for (int i = 0; i < shuffled.size(); i++) {
                if (shuffled.get(i).getId().equals(userId)) {
                    userIndex = i;
                    break;
                }
            }
            if (userIndex == -1) continue; // user not available for this sport today

            int groupStart = (userIndex / groupSize) * groupSize;
            int groupEnd = Math.min(groupStart + groupSize, shuffled.size());
            List<Profile> group = shuffled.subList(groupStart, groupEnd);

            // Captain is deterministically the first in the group
            Profile captain = group.get(0);

            // Load confirmed players for today
            List<UUID> confirmedIds = matchConfirmationRepository.findConfirmedProfileIdsBySportAndDate(sport, today);
            Set<UUID> confirmedSet = new HashSet<>(confirmedIds);

            long confirmedCount = group.stream().filter(p -> confirmedSet.contains(p.getId())).count();
            boolean currentUserConfirmed = confirmedSet.contains(userId);

            List<Map<String, Object>> players = group.stream().map(p -> {
                Map<String, Object> player = new HashMap<>();
                player.put("id", p.getId());
                player.put("username", p.getUsername());
                player.put("avatarUrl", p.getAvatarUrl());
                player.put("skillLevel", p.getSkillLevel());
                player.put("isCaptain", p.getId().equals(captain.getId()));
                player.put("isConfirmed", confirmedSet.contains(p.getId()));
                return player;
            }).toList();

            Map<String, Object> result = new HashMap<>();
            result.put("sport", sport);
            result.put("totalPlayers", group.size());
            result.put("minRequired", range[0]);
            result.put("readyToPlay", group.size() >= range[0]);
            result.put("confirmedCount", confirmedCount);
            result.put("currentUserConfirmed", currentUserConfirmed);
            result.put("captain", Map.of("id", captain.getId(), "username", captain.getUsername()));
            result.put("players", players);
            results.add(result);
        }

        return results;
    }

    @Override
    public void confirmPlayer(String sport) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UUID userId = userDetails.getId();
        LocalDate today = LocalDate.now();

        if (!matchConfirmationRepository.existsByProfileIdAndSportAndConfirmedDate(userId, sport, today)) {
            matchConfirmationRepository.save(new MatchConfirmation(userId, sport, today));
        }
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
