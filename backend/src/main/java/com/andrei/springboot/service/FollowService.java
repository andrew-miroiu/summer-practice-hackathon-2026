package com.andrei.springboot.service;

import com.andrei.springboot.dto.FollowResponseDTO;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public interface FollowService {
    FollowResponseDTO follow(String targetUserId);
    Map<String, Boolean> unfollow(String targetUserId);
}