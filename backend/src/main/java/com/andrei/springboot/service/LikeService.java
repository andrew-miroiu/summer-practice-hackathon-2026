package com.andrei.springboot.service;

import com.andrei.springboot.model.Like;

import java.util.List;
import java.util.UUID;

public interface LikeService {
    boolean toggleLike(UUID postId);
}