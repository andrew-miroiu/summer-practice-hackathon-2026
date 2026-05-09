package com.andrei.springboot.controller;

import com.andrei.springboot.service.CommentService;
import com.andrei.springboot.dto.CommentResponseDTO;
import com.andrei.springboot.dto.CreateCommentRequestDTO;
import com.andrei.springboot.dto.CommentResponseWithUsernameDTO;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    } 

    @GetMapping("/post/{postId}")
    public List<CommentResponseWithUsernameDTO> getCommentsByPostId(@PathVariable UUID postId){
        return commentService.getCommentsByPostId(postId);
    }

    @PostMapping("/postComment")
    public ResponseEntity<CommentResponseDTO> createComment(@RequestBody @Valid CreateCommentRequestDTO request){
        return ResponseEntity.ok(commentService.createComment(request));
    }

}