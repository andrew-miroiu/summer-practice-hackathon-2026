package com.andrei.springboot.service;

import com.andrei.springboot.dto.PostResponseDTO;
import com.andrei.springboot.dto.PostWithCountsDTO;
import com.andrei.springboot.model.Post;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface PostService {
    
    List<PostResponseDTO> getAllPosts();
    List<PostResponseDTO> getPostsByUser(String id);
    List<PostWithCountsDTO> getPostsWithCounts();
    PostResponseDTO createPost(String content, MultipartFile file) throws Exception;

}