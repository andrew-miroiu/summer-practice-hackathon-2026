package com.andrei.springboot.repository;

import com.andrei.springboot.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface EventRepository extends JpaRepository<Event, UUID> {

    @Query("SELECT e FROM Event e WHERE CAST(e.dateTime AS date) = CAST(:date AS date) ORDER BY e.dateTime ASC")
List<Event> findEventsByDate(@Param("date") LocalDate date);

@Query("SELECT e FROM Event e WHERE e.dateTime >= :start AND e.dateTime <= :end ORDER BY e.dateTime ASC")
List<Event> findEventsThisWeek(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT e FROM Event e WHERE e.sport = :sport AND CAST(e.dateTime AS date) = CURRENT_DATE")
    List<Event> findTodaysEventsBySport(@Param("sport") String sport);
}