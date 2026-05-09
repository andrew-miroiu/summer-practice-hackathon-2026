package com.andrei.springboot.service.impl;

import com.andrei.springboot.service.CommentService;
import com.andrei.springboot.repository.CommentRepository;
import org.springframework.stereotype.Service;
import com.andrei.springboot.dto.CommentResponseDTO;
import com.andrei.springboot.dto.CreateCommentRequestDTO;
import com.andrei.springboot.dto.CommentResponseWithUsernameDTO;
import com.andrei.springboot.model.Comment;
import com.andrei.springboot.security.CustomUserDetails;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;
import java.time.OffsetDateTime;
import java.time.Instant;
import java.time.ZoneOffset;

@Service
public class CommentServiceImpl implements CommentService{

    private final CommentRepository commentRepository;

    public CommentServiceImpl(CommentRepository commentRepository){
        this.commentRepository = commentRepository;
    }

    @Override
    public List<CommentResponseWithUsernameDTO> getCommentsByPostId(UUID postId) {
        List<Object[]> rows = commentRepository.findCommentsWithUsernameByPostId(postId);

        return rows.stream().map(row -> new CommentResponseWithUsernameDTO(
            (UUID) row[0],              // comment id
            (UUID) row[1],              // post id
            (String) row[2],            // user id (text)
            (String) row[3],            // comment text
            (String) row[4],            // username
            row[5] == null ? null : ((Instant) row[5]).atOffset(ZoneOffset.UTC)  // created_at
        )).toList();
    }

    @Override
    public CommentResponseDTO createComment(CreateCommentRequestDTO request){

        CustomUserDetails userDetails =(CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String userId = userDetails.getId().toString();

        Comment comment = new Comment(request.getPostId(), userId, request.getText());

        Comment saved = commentRepository.save(comment);

        return new CommentResponseDTO(saved.getId(), saved.getPostId(), saved.getUserId(), saved.getText(), saved.getCreatedAt());
    }

}