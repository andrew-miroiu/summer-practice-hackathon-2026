package com.andrei.springboot.controller;

import com.andrei.springboot.dto.ToggleLikeRequestDTO;
import com.andrei.springboot.dto.ToggleLikeResponseDTO;
import com.andrei.springboot.service.LikeService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    } 

    @PostMapping("/toggleLike")
    public ResponseEntity<ToggleLikeResponseDTO> toggleLike(@Valid @RequestBody ToggleLikeRequestDTO request) {

        boolean liked = likeService.toggleLike(request.getPostId());

        return ResponseEntity.ok(new ToggleLikeResponseDTO(liked));
    }

}