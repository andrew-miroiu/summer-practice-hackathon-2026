package com.andrei.springboot.repository;

import com.andrei.springboot.model.Profile;
import com.andrei.springboot.dto.ProfileResponseDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Profile findById(String id);
    List<Profile> findByIdNotOrderByCreatedAtDesc(UUID id);
    Profile findProfileById(UUID id);

    @Modifying
    @Transactional
    @Query("UPDATE Profile p SET p.avatarUrl = :url WHERE p.id = :id")
    void updateAvatarUrl(@Param("id") UUID id, @Param("url") String url);

    @Modifying
    @Transactional
    @Query("UPDATE Profile p SET p.availableToday = :available WHERE p.id = :id")
    void updateAvailability(@Param("id") UUID id, @Param("available") Boolean available);

    @Query("""
        SELECT DISTINCT p FROM Profile p
        JOIN p.sportsPreferences sp
        WHERE sp = :sport AND p.availableToday = true
    """)
    List<Profile> findAvailableProfilesBySport(@Param("sport") String sport);

    @Query("""
        SELECT p.id, p.username, p.avatarUrl, p.createdAt,
            CASE WHEN f.id IS NOT NULL THEN true ELSE false END AS following
        FROM Profile p
        LEFT JOIN Follow f
            ON CAST(f.followingId AS uuid) = p.id 
            AND CAST(f.followerId AS uuid) = :userId
        WHERE p.id <> :userId
        ORDER BY p.createdAt DESC
    """)
    List<Object[]> findAllProfilesWithFollowingRaw(@Param("userId") UUID userId);

    @Query("""
        SELECT p.id, p.username, p.avatarUrl, p.createdAt,
            (SELECT COUNT(f1) FROM Follow f1 WHERE CAST(f1.followingId AS uuid) = p.id),
            (SELECT COUNT(f2) FROM Follow f2 WHERE CAST(f2.followerId AS uuid) = p.id)
        FROM Profile p
        WHERE p.id = :userId
    """)
    List<Object[]> findProfileWithFollowersAndFollowing(@Param("userId") UUID userId);
}