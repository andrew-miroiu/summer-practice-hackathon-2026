package com.andrei.springboot.service.impl;

import com.andrei.springboot.repository.FollowRepository;
import com.andrei.springboot.service.FollowService;
import com.andrei.springboot.dto.FollowResponseDTO;
import com.andrei.springboot.model.Follow;

import com.andrei.springboot.security.CustomUserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class FollowServiceImpl implements FollowService {

    private final FollowRepository followRepository;

    public FollowServiceImpl(FollowRepository followRepository){
        this.followRepository = followRepository;
    }

    @Override
    public FollowResponseDTO follow(String targetUserId){
        CustomUserDetails userDetails =(CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String userId = userDetails.getId().toString();

        Follow follow = new Follow(userId, targetUserId);

        followRepository.save(follow);

        return new FollowResponseDTO(
            follow.getId(),
            follow.getFollowerId(),
            follow.getFollowingId(),
            follow.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public Map<String, Boolean> unfollow(String targetUserId){
        CustomUserDetails userDetails =(CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String userId = userDetails.getId().toString();

        //Follow follow = new Follow(userId, targetUserId);

        followRepository.deleteByFollowerIdAndFollowingId(userId, targetUserId);

        return Map.of("success", true);
    }
}