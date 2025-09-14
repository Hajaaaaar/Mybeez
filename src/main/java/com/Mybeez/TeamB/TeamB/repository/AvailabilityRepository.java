package com.Mybeez.TeamB.TeamB.repository;

import com.Mybeez.TeamB.TeamB.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List; // <-- Make sure to import List

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Integer> {

    // Finds all availability for an experience with a specific capacity
    List<Availability> findByExperienceIdAndCapacity(Long experienceId, Integer capacity);

    // Finds all availability for an experience with capacity greater than a value
    List<Availability> findByExperienceIdAndCapacityGreaterThan(Long experienceId, Integer capacity);


    /**
     * Find availability slots by host ID and date range
     * This joins through the Experience entity to get the host
     */
    @Query("SELECT a FROM Availability a WHERE a.experience.host.id = :hostId AND " +
            "a.date BETWEEN :startDate AND :endDate " +
            "ORDER BY a.date ASC, a.startTime ASC")
    List<Availability> findByExperienceHostIdAndDateBetween(
            @Param("hostId") Long hostId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Find all availability slots for a host
     */
    @Query("SELECT a FROM Availability a WHERE a.experience.host.id = :hostId " +
            "ORDER BY a.date ASC, a.startTime ASC")
    List<Availability> findByExperienceHostIdOrderByDateAsc(@Param("hostId") Long hostId);

    /**
     * Find availability slots for a specific experience
     */
    List<Availability> findByExperienceIdOrderByDateAsc(Long experienceId);

    /**
     * Find availability slots for a host on a specific date
     */
    @Query("SELECT a FROM Availability a WHERE a.experience.host.id = :hostId AND a.date = :date " +
            "ORDER BY a.startTime ASC")
    List<Availability> findByExperienceHostIdAndDate(
            @Param("hostId") Long hostId,
            @Param("date") LocalDate date
    );

    /**
     * Find availability slots that overlap with a time range (for conflict checking)
     */
    @Query("SELECT a FROM Availability a WHERE a.experience.host.id = :hostId AND " +
            "a.date = :date AND " +
            "((a.startTime < :endTime AND a.endTime > :startTime))")
    List<Availability> findOverlappingAvailability(
            @Param("hostId") Long hostId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    /**
     * Find upcoming availability slots for a host (next 30 days)
     */
    @Query("SELECT a FROM Availability a WHERE a.experience.host.id = :hostId AND " +
            "a.date >= CURRENT_DATE AND a.date <= :endDate " +
            "ORDER BY a.date ASC, a.startTime ASC")
    List<Availability> findUpcomingAvailability(
            @Param("hostId") Long hostId,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Count availability slots for a host on a specific date (useful for dashboard stats)
     */
    @Query("SELECT COUNT(a) FROM Availability a WHERE a.experience.host.id = :hostId AND a.date = :date")
    long countByExperienceHostIdAndDate(@Param("hostId") Long hostId, @Param("date") LocalDate date);
}