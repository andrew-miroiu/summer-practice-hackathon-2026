package com.andrei.springboot.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ToggleLikeRequestDTO {

    @NotNull
    private UUID postId;

    public ToggleLikeRequestDTO() {
    }

    public ToggleLikeRequestDTO(UUID postId) {
        this.postId = postId;
    }

    public UUID getPostId() {
        return postId;
    }

    public void setPostId(UUID postId) {
        this.postId = postId;
    }
}