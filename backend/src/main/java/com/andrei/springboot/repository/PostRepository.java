package com.andrei.springboot.repository;

import com.andrei.springboot.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // <--- trebuie
import java.util.List;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {

    List<Post> findByUserId(String id);

    @Query(
        value = """
            SELECT 
                p.id AS post_id,
                p.text,
                p.image_url,
                p.video_url,
                p.created_at,
                p.updated_at,
                pr.id AS user_id,
                pr.username,
                pr.avatar_url,

                -- total like-uri
                (SELECT COUNT(*) 
                FROM likes l 
                WHERE l.post_id = p.id) AS like_count,

                -- total commenturi
                (SELECT COUNT(*)
                FROM comments c
                WHERE c.post_id = p.id) AS comment_count,

                -- daca userul a dat like
                EXISTS (
                    SELECT 1
                    FROM likes l2
                    WHERE l2.post_id = p.id
                    AND l2.user_id = :userId
                ) AS is_liked

            FROM posts p
            LEFT JOIN profiles_java pr 
                ON pr.id::text = p.user_id

            ORDER BY p.created_at DESC
            """,
        nativeQuery = true
    )
    List<Object[]> findAllPostsWithCountsNative(@Param("userId") String userId);

     List<Post> findByUserIdOrderByCreatedAtDesc(String userId);
}