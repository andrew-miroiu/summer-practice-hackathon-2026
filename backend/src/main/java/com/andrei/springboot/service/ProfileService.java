package com.andrei.springboot.service;

import com.andrei.springboot.model.Profile;
import com.andrei.springboot.dto.ProfileResponseDTO;
import com.andrei.springboot.dto.ProfileResponseWithFollowsDTO;
import com.andrei.springboot.dto.ProfilePageDTO;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

public interface ProfileService {
    List<ProfileResponseWithFollowsDTO> getAllProfiles();
    ProfileResponseDTO getOwnProfile();
    String updateProfile(MultipartFile file);
    ProfilePageDTO getProfileById(UUID id);
    void updateAvailability(Boolean available);
    void updateSportsAndSkill(List<String> sports, String skillLevel, String description, String city);
    List<Profile> getAvailableProfilesBySport(String sport);
}