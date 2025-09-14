package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.model.PersonalScheduleEntry;
import com.Mybeez.TeamB.TeamB.payload.PersonalScheduleRequest;
import com.Mybeez.TeamB.TeamB.payload.PersonalScheduleResponse;
import com.Mybeez.TeamB.TeamB.repository.PersonalScheduleEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PersonalScheduleService {

    private final PersonalScheduleEntryRepository repository;

    /**
     * Get personal schedule entries for a host within a date range.
     */
    @Transactional(readOnly = true)
    public List<PersonalScheduleEntry> getPersonalEntriesByHostAndDateRange(
            Long hostId, ZonedDateTime startDate, ZonedDateTime endDate) {

        log.debug("Fetching personal schedule entries for host {} from {} to {}",
                hostId, startDate, endDate);

        return repository.findByHostIdAndDateRange(hostId, startDate, endDate);
    }

    /**
     * Get all personal schedule entries for a host.
     */
    @Transactional(readOnly = true)
    public List<PersonalScheduleEntry> getAllPersonalEntriesByHost(Long hostId) {
        log.debug("Fetching all personal schedule entries for host {}", hostId);
        return repository.findByHostIdOrderByStartTimeAsc(hostId);
    }

    /**
     * Get all personal schedule entries for a host as DTOs.
     */
    @Transactional(readOnly = true)
    public List<PersonalScheduleResponse> getAllPersonalEntriesByHostAsDTO(Long hostId) {
        List<PersonalScheduleEntry> entries = repository.findByHostIdOrderByStartTimeAsc(hostId);
        return entries.stream()
                .map(PersonalScheduleResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific personal schedule entry by its ID and the host's ID.
     */
    @Transactional(readOnly = true)
    public PersonalScheduleEntry getPersonalEntryById(Long id, Long hostId) {
        log.debug("Fetching personal schedule entry {} for host {}", id, hostId);

        return repository.findByIdAndHostId(id, hostId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Personal schedule entry not found or does not belong to host"));
    }

    /**
     * Create a new personal schedule entry.
     */
    public PersonalScheduleEntry createPersonalEntry(Long hostId, PersonalScheduleRequest request) {
        log.info("Creating personal schedule entry for host {}: {}", hostId, request.getTitle());

        validateScheduleRequest(request);

        List<PersonalScheduleEntry> overlapping = repository.findOverlappingEntriesForNewEntry(
                hostId, request.getStartTime(), request.getEndTime());

        if (!overlapping.isEmpty()) {
            log.warn("Personal schedule entry overlaps with existing entry: {}",
                    overlapping.get(0).getTitle());
            throw new IllegalArgumentException("Entry overlaps with existing personal schedule: " +
                    overlapping.get(0).getTitle());
        }

        PersonalScheduleEntry entry = PersonalScheduleEntry.builder()
                .hostId(hostId)
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        PersonalScheduleEntry saved = repository.save(entry);
        log.info("Successfully created personal schedule entry with ID: {}", saved.getId());

        return saved;
    }

    /**
     * Update an existing personal schedule entry.
     */
    public PersonalScheduleEntry updatePersonalEntry(Long id, Long hostId,
                                                     PersonalScheduleRequest request) {
        log.info("Updating personal schedule entry {} for host {}", id, hostId);

        validateScheduleRequest(request);

        PersonalScheduleEntry existing = repository.findByIdAndHostId(id, hostId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Personal schedule entry not found or does not belong to host"));

        List<PersonalScheduleEntry> overlapping = repository.findOverlappingEntries(
                hostId, request.getStartTime(), request.getEndTime(), id);

        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Entry overlaps with existing personal schedule: " +
                    overlapping.get(0).getTitle());
        }

        existing.setTitle(request.getTitle().trim());
        existing.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        existing.setStartTime(request.getStartTime());
        existing.setEndTime(request.getEndTime());

        PersonalScheduleEntry updated = repository.save(existing);
        log.info("Successfully updated personal schedule entry {}", id);

        return updated;
    }

    /**
     * Delete a personal schedule entry.
     */
    public void deletePersonalEntry(Long id, Long hostId) {
        log.info("Deleting personal schedule entry {} for host {}", id, hostId);

        PersonalScheduleEntry entry = repository.findByIdAndHostId(id, hostId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Personal schedule entry not found or does not belong to host"));

        repository.delete(entry);
        log.info("Successfully deleted personal schedule entry {}", id);
    }

    /**
     * Check if a time slot is available for a host.
     */
    @Transactional(readOnly = true)
    public boolean isTimeSlotAvailable(Long hostId, ZonedDateTime startTime, ZonedDateTime endTime) {
        log.debug("Checking time slot availability for host {} from {} to {}",
                hostId, startTime, endTime);

        List<PersonalScheduleEntry> overlapping = repository.findOverlappingEntriesForNewEntry(
                hostId, startTime, endTime);

        boolean isAvailable = overlapping.isEmpty();
        log.debug("Time slot availability result: {}", isAvailable);

        return isAvailable;
    }

    /**
     * Delete all personal schedule entries for a host.
     */
    public void deleteAllPersonalEntriesForHost(Long hostId) {
        log.warn("Deleting all personal schedule entries for host {}", hostId);
        repository.deleteByHostId(hostId);
    }

    /**
     * Validates the integrity of the schedule request data.
     */
    private void validateScheduleRequest(PersonalScheduleRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }

        if (request.getEndTime().isBefore(request.getStartTime()) ||
                request.getEndTime().equals(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }

        if (request.getStartTime().plusHours(24).isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Event duration cannot exceed 24 hours");
        }

        if (request.getStartTime().plusMinutes(15).isAfter(request.getEndTime())) {
            throw new IllegalArgumentException("Event must be at least 15 minutes long");
        }
    }
}