package com.andrei.springboot.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.andrei.springboot.model.Follow;

import java.util.*;

public interface FollowRepository extends JpaRepository<Follow, UUID> {

    int deleteByFollowerIdAndFollowingId(String followerId, String followingId);
    
}