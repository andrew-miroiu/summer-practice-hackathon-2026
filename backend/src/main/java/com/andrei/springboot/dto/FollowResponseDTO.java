package com.andrei.springboot.dto;

import java.util.*;
import java.time.OffsetDateTime;

public class FollowResponseDTO {

    private UUID id;
    private String followerId;
    private String followingId;
    private OffsetDateTime createdAt;

    public FollowResponseDTO() {}

    public FollowResponseDTO(UUID id, String followerId, String followingId, OffsetDateTime createdAt){
        this.id = id;
        this.followerId = followerId;
        this.followingId = followingId;
        this.createdAt = createdAt;
    }

    public UUID getId(){
        return id;
    }

    public void setId(UUID id){
        this.id = id;
    }

     public String getFollowerId() {
        return followerId;
    }

    public void setFollowerId(String followerId) {
        this.followerId = followerId;
    }

    public String getFollowingId() {
        return followingId;
    }

    public void setFollowingId(String followingId) {
        this.followingId = followingId;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}