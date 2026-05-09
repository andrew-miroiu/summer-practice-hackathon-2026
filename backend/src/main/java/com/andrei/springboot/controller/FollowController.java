package com.andrei.springboot.controller;

import com.andrei.springboot.service.FollowService;
import com.andrei.springboot.dto.FollowResponseDTO;

import org.springframework.web.bind.annotation.*;



import java.util.Map;
import java.util.*;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService){
        this.followService = followService;
    }

    @PostMapping("/{targetUserId}")
    public FollowResponseDTO follow(@PathVariable String targetUserId){
        return followService.follow(targetUserId);
    }

    @DeleteMapping("/{targetUserId}")
    public Map<String, Boolean> unfollow(@PathVariable String targetUserId){
        followService.unfollow(targetUserId);
        return Map.of("success", true);
    }

}