package com.andrei.springboot.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PostWithCountsDTO {

    private UUID postId;
    private String text;
    private String imageUrl;
    private String videoUrl;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private UUID userId;
    private String username;
    private String avatarUrl;

    private Long likeCount;
    private Long commentCount;
    private boolean liked;

    public PostWithCountsDTO(UUID postId, String text, String imageUrl, String videoUrl,
                             OffsetDateTime createdAt, OffsetDateTime updatedAt,
                             UUID userId, String username, String avatarUrl,
                             Long likeCount, Long commentCount, boolean liked) {
        this.postId = postId;
        this.text = text;
        this.imageUrl = imageUrl;
        this.videoUrl = videoUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.userId = userId;
        this.username = username;
        this.avatarUrl = avatarUrl;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.liked = liked;
    }

    // Gettere și settere
    public UUID getPostId() { return postId; }
    public String getText() { return text; }
    public String getImageUrl() { return imageUrl; }
    public String getVideoUrl() { return videoUrl; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public UUID getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getAvatarUrl() { return avatarUrl; }
    public Long getLikeCount() { return likeCount; }
    public Long getCommentCount() { return commentCount; }
    public boolean getLiked() {return liked;}

    public void setPostId(UUID postId) { this.postId = postId; }
    public void setText(String text) { this.text = text; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public void setUsername(String username) { this.username = username; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public void setLikeCount(Long likeCount) { this.likeCount = likeCount; }
    public void setCommentCount(Long commentCount) { this.commentCount = commentCount; }
    public void setLikeCount(boolean liked) { this.liked = liked; }
}