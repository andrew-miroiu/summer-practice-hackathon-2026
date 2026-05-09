package com.andrei.springboot.repository;

import com.andrei.springboot.model.MatchConfirmation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MatchConfirmationRepository extends JpaRepository<MatchConfirmation, UUID> {

    boolean existsByProfileIdAndSportAndConfirmedDate(UUID profileId, String sport, LocalDate date);

    @Query("SELECT m.profileId FROM MatchConfirmation m WHERE m.sport = :sport AND m.confirmedDate = :date")
    List<UUID> findConfirmedProfileIdsBySportAndDate(@Param("sport") String sport, @Param("date") LocalDate date);
}
