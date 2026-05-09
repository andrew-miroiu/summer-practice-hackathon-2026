package com.andrei.springboot.dto;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import java.time.OffsetDateTime;
import java.util.UUID;

public class CommentResponseDTO {

    private UUID id;
    private UUID postId;
    private String userId;
    private String text;
    private OffsetDateTime createdAt;

    public CommentResponseDTO() {}

    public CommentResponseDTO(UUID id, UUID postId, String userId, String text, OffsetDateTime createdAt){
        this.id = id;
        this.postId = postId;
        this.userId = userId;  
        this.text = text;
        this.createdAt = createdAt;
    }

    public UUID getId(){
        return id;
    }

    public void setId(UUID id){
        this.id = id;
    }

    public UUID getPostId(){
        return postId;
    }

    public void setPostId(UUID postId){
        this.postId = postId;
    }

    public String getUserId(){
        return userId;
    }

    public void setUserId(String userId){
        this.userId = userId;
    }

    public String getText(){
        return text;
    }

    public void setText(String text){
        this.text = text;
    }

    public OffsetDateTime getCreatedAt() { 
        return createdAt; 
    }

    public void setCreatedAt(OffsetDateTime createdAt) { 
        this.createdAt = createdAt; 
    }

}