package com.andrei.springboot.dto;

public class ToggleLikeResponseDTO {

    private boolean liked;

    public ToggleLikeResponseDTO() {
    }

    public ToggleLikeResponseDTO(boolean liked) {
        this.liked = liked;
    }

    public boolean isLiked() {
        return liked;
    }

    public void setLiked(boolean liked) {
        this.liked = liked;
    }
}