package com.andrei.springboot.service;

import com.andrei.springboot.model.Comment;
import com.andrei.springboot.dto.CommentResponseDTO;
import com.andrei.springboot.dto.CreateCommentRequestDTO;
import com.andrei.springboot.dto.CommentResponseWithUsernameDTO;


import java.util.List;
import java.util.UUID;

public interface CommentService {
    List<CommentResponseWithUsernameDTO> getCommentsByPostId(UUID postId);
    CommentResponseDTO createComment(CreateCommentRequestDTO request);
}