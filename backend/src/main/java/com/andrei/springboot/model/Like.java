package com.andrei.springboot.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "likes")
public class Like {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
        name = "UUID",
        strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(name = "id")
    private UUID id;

    @Column(name = "post_id")
    private UUID postId;

    @Column(name = "user_id")
    private String userId;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    public Like() {

    }

    public Like(UUID postId, String userId) {
        this.postId = postId;
        this.userId = userId;
    }

    public UUID getId() { 
        return id; 
    }

    public void setId(UUID id) {
        this.id = id; 
    }

    public UUID getPostId() { 
        return postId; 
    }

    public void setPostId(UUID postId) { 
        this.postId = postId; 
    }

    public String getUserId() { 
        return userId; 
    }

    public void setUserId(String userId) { 
        this.userId = userId; 
    }

    public OffsetDateTime getCreatedAt() { 
        return createdAt; 
    }

    public void setCreatedAt(OffsetDateTime createdAt) { 
        this.createdAt = createdAt; 
    }
}