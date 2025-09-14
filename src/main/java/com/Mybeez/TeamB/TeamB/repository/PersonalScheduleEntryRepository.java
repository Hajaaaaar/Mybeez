package com.Mybeez.TeamB.TeamB.repository;

import com.Mybeez.TeamB.TeamB.model.PersonalScheduleEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalScheduleEntryRepository extends JpaRepository<PersonalScheduleEntry, Long> {

    /**
     * Find all personal schedule entries for a host within a date range.
     */
    @Query("SELECT p FROM PersonalScheduleEntry p WHERE p.hostId = :hostId AND " +
            "((p.startTime >= :startDate AND p.startTime <= :endDate) OR " +
            "(p.endTime >= :startDate AND p.endTime <= :endDate) OR " +
            "(p.startTime <= :startDate AND p.endTime >= :endDate)) " +
            "ORDER BY p.startTime ASC")
    List<PersonalScheduleEntry> findByHostIdAndDateRange(
            @Param("hostId") Long hostId,
            @Param("startDate") ZonedDateTime startDate,
            @Param("endDate") ZonedDateTime endDate
    );

    /**
     * Find all personal schedule entries for a host.
     */
    List<PersonalScheduleEntry> findByHostIdOrderByStartTimeAsc(Long hostId);

    /**
     * Find overlapping entries for conflict detection, excluding a specific entry.
     */
    @Query("SELECT p FROM PersonalScheduleEntry p WHERE p.hostId = :hostId AND " +
            "p.id != :excludeId AND " +
            "(p.startTime < :endTime AND p.endTime > :startTime)")
    List<PersonalScheduleEntry> findOverlappingEntries(
            @Param("hostId") Long hostId,
            @Param("startTime") ZonedDateTime startTime,
            @Param("endTime") ZonedDateTime endTime,
            @Param("excludeId") Long excludeId
    );

    /**
     * Find overlapping entries for new entry creation.
     */
    @Query("SELECT p FROM PersonalScheduleEntry p WHERE p.hostId = :hostId AND " +
            "(p.startTime < :endTime AND p.endTime > :startTime)")
    List<PersonalScheduleEntry> findOverlappingEntriesForNewEntry(
            @Param("hostId") Long hostId,
            @Param("startTime") ZonedDateTime startTime,
            @Param("endTime") ZonedDateTime endTime
    );

    /**
     * Find a personal schedule entry by its ID and the host's ID (for authorization).
     */
    Optional<PersonalScheduleEntry> findByIdAndHostId(Long id, Long hostId);

    /**
     * Delete all entries for a host.
     */
    void deleteByHostId(Long hostId);
}