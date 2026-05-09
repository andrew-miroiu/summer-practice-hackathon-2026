package com.andrei.springboot.service.impl;

import com.andrei.springboot.dto.PostResponseDTO;
import com.andrei.springboot.dto.PostWithCountsDTO;
import com.andrei.springboot.model.Post;
import com.andrei.springboot.model.Profile;
import com.andrei.springboot.repository.PostRepository;
import com.andrei.springboot.repository.ProfileRepository;
import com.andrei.springboot.service.PostService;
import com.andrei.springboot.security.CustomUserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.andrei.springboot.service.StorageService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Qualifier;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.*;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.Instant;

@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final ProfileRepository profileRepository;
    private final StorageService storageService;

    public PostServiceImpl(PostRepository postRepository, ProfileRepository profileRepository, @Qualifier("storageService") StorageService storageService) {
        this.postRepository = postRepository;
        this.profileRepository = profileRepository;
        this.storageService = storageService;
    }

    @Override
    public List<PostResponseDTO> getAllPosts() {

        List<Post> posts = postRepository.findAll();
        List<PostResponseDTO> response = new ArrayList<>();

        for (Post post : posts) {

            Profile profile = null;

            try {
                UUID profileId = UUID.fromString(post.getUserId());
                profile = profileRepository.findById(profileId).orElse(null);
            } catch (Exception e) {
                profile = null;
            }

            PostResponseDTO dto = new PostResponseDTO(
                    post.getId(),
                    post.getText(),
                    post.getImageUrl(),
                    post.getVideoUrl(),
                    post.getCreatedAt(),
                    post.getUpdatedAt(),
                    profile != null ? profile.getId().toString() : null,
                    profile != null ? profile.getUsername() : "Unknown",
                    profile != null ? profile.getAvatarUrl() : null
            );

            response.add(dto);
        }

        return response;
    }

    @Override
    public List<PostResponseDTO> getPostsByUser(String id){
        //order by createdAt desc in repository
        List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(id);
        List<PostResponseDTO> response = new ArrayList<>();
        Profile profile = null;

         try {
                UUID profileId = UUID.fromString(id);
                profile = profileRepository.findById(profileId).orElse(null);
        } catch (Exception e) {
                profile = null;
        }

        for (Post post : posts) {

            PostResponseDTO dto = new PostResponseDTO(
                    post.getId(),
                    post.getText(),
                    post.getImageUrl(),
                    post.getVideoUrl(),
                    post.getCreatedAt(),
                    post.getUpdatedAt(),
                    profile != null ? profile.getId().toString() : null,
                    profile != null ? profile.getUsername() : "Unknown",
                    profile != null ? profile.getAvatarUrl() : null
            );

            response.add(dto);
        }

        return response;
    }

   @Override
    public List<PostWithCountsDTO> getPostsWithCounts() {

        CustomUserDetails userDetails =(CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String userId = userDetails.getId().toString();
        
        List<Object[]> results = postRepository.findAllPostsWithCountsNative(userId);
        List<PostWithCountsDTO> dtos = new ArrayList<>();

        for (Object[] row : results) {
            dtos.add(new PostWithCountsDTO(
                // Post ID e UUID în DB
                (UUID) row[0],
                (String) row[1], // text
                (String) row[2], // imageUrl
                (String) row[3], // videoUrl
                ((Instant) row[4]).atOffset(ZoneOffset.UTC), // createdAt
                ((Instant) row[5]).atOffset(ZoneOffset.UTC), // updatedAt
                (UUID) row[6],
                (String) row[7], // username
                (String) row[8], // avatarUrl
                ((Number) row[9]).longValue(), // likeCount
                ((Number) row[10]).longValue(),
                ((Boolean) row[11])
            ));
        }

        return dtos;
    }

    @Override
    public PostResponseDTO createPost(String content, MultipartFile file) throws Exception {

        String imageUrl = null;
        String videoUrl = null;

        if (file != null && !file.isEmpty()) {

            String publicUrl = storageService.uploadFile(file);

            if (file.getContentType().startsWith("image/")) {
                imageUrl = publicUrl;
            } else if (file.getContentType().startsWith("video/")) {
                videoUrl = publicUrl;
            }
        }

        CustomUserDetails userDetails =
                (CustomUserDetails) SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getPrincipal();

        String userId = userDetails.getId().toString();

        Post post = new Post();
        post.setId(UUID.randomUUID());
        post.setText(content);
        post.setImageUrl(imageUrl);
        post.setVideoUrl(videoUrl);
        post.setUserId(userId);
        post.setCreatedAt(OffsetDateTime.now());
        post.setUpdatedAt(OffsetDateTime.now());

        Post saved = postRepository.save(post);

        Profile profile =
                profileRepository.findById(UUID.fromString(userId))
                        .orElse(null);

        return new PostResponseDTO(
                saved.getId(),
                saved.getText(),
                saved.getImageUrl(),
                saved.getVideoUrl(),
                saved.getCreatedAt(),
                saved.getUpdatedAt(),
                profile != null ? profile.getId().toString() : null,
                profile != null ? profile.getUsername() : "Unknown",
                profile != null ? profile.getAvatarUrl() : null
        );
    }

}