package com.andrei.springboot.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.andrei.springboot.dto.ProfileResponseDTO;
import com.andrei.springboot.service.ProfileService;
import com.andrei.springboot.dto.ProfileResponseWithFollowsDTO;
import com.andrei.springboot.dto.ProfilePageDTO;
import com.andrei.springboot.model.Profile;
import java.util.*;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService){
        this.profileService = profileService;
    }

    @GetMapping
    public List<ProfileResponseWithFollowsDTO> getAllProfiles(){
        return profileService.getAllProfiles();
    }

    @GetMapping("/{id}")
    public ProfilePageDTO getProfileById(@PathVariable UUID id){
        return profileService.getProfileById(id);
    }

    @GetMapping("/getOwnProfile")
    public ProfileResponseDTO getOwnProfile(){
        return profileService.getOwnProfile();
    }

    @PostMapping("/updateProfile")
    public String updateProfile(@RequestParam(value = "file", required = false) MultipartFile file){
        return profileService.updateProfile(file);
    }

    @PostMapping("/availability")
    public void updateAvailability(@RequestParam Boolean available){
        profileService.updateAvailability(available);
    }

    @PostMapping("/updateSportsAndSkill")
    public void updateSportsAndSkill(
            @RequestParam List<String> sports,
            @RequestParam String skillLevel,
            @RequestParam String description){
        profileService.updateSportsAndSkill(sports, skillLevel, description);
    }

    @GetMapping("/available")
    public List<Profile> getAvailableProfilesBySport(@RequestParam String sport){
        return profileService.getAvailableProfilesBySport(sport);
    }
}