package com.andrei.springboot.controller;

import com.andrei.springboot.dto.PostResponseDTO;
import com.andrei.springboot.dto.PostWithCountsDTO;
import com.andrei.springboot.model.Post;
import com.andrei.springboot.service.PostService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/posts-without-counts")
    public List<PostResponseDTO> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping()
    public List<PostWithCountsDTO> getPostsWithCounts() {
        return postService.getPostsWithCounts();
    }

    @GetMapping("/{id}")
    public List<PostResponseDTO> getPostsByUser(@PathVariable String id) {
        return postService.getPostsByUser(id);
    }

    @PostMapping
    public ResponseEntity<PostResponseDTO> createPost(
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws Exception {

        PostResponseDTO dto = postService.createPost(content, file);

        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
}