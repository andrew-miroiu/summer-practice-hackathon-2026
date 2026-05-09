package com.andrei.springboot.service.impl;

import com.andrei.springboot.dto.PostResponseDTO;
import com.andrei.springboot.dto.PostWithCountsDTO;
import com.andrei.springboot.model.Like;
import com.andrei.springboot.model.Profile;
import com.andrei.springboot.repository.LikeRepository;
import com.andrei.springboot.repository.ProfileRepository;
import com.andrei.springboot.service.LikeService;
import com.andrei.springboot.security.CustomUserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.*;

@Service
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;

    public LikeServiceImpl(LikeRepository likeRepository) {
        this.likeRepository = likeRepository;
    }

    @Override
    public boolean toggleLike(UUID postId){
        CustomUserDetails userDetails =(CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String userId = userDetails.getId().toString();

        Optional<Like> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);

         if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            return false; // now unliked
        } else {
            Like like = new Like(postId, userId);
            likeRepository.save(like);
            return true;
        } 
    }
}