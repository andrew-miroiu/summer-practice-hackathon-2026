package com.andrei.springboot.repository;

import com.andrei.springboot.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.Optional;
import java.util.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    
    List<Comment> findByPostId(UUID postId);

    @Query(value = """
        SELECT c.id, c.post_id, c.user_id, c.text, p.username, c.created_at
        FROM comments c
        JOIN profiles_java p
        ON c.user_id::uuid = p.id
        WHERE c.post_id = :postId
        ORDER BY c.created_at ASC
        """, nativeQuery = true)
    List<Object[]> findCommentsWithUsernameByPostId(@Param("postId") UUID postId);
}