package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.Availability;
import com.Mybeez.TeamB.TeamB.model.PersonalScheduleEntry;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.CalendarEventResponse;
import com.Mybeez.TeamB.TeamB.payload.PersonalScheduleRequest;
import com.Mybeez.TeamB.TeamB.service.AvailabilityService;
import com.Mybeez.TeamB.TeamB.service.PersonalScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
@RequiredArgsConstructor
@Slf4j
public class CalendarController {

    private final PersonalScheduleService personalScheduleService;
    private final AvailabilityService availabilityService;

    /**
     * Get unified calendar events for the authenticated host.
     * Shows both experience availability slots and personal schedule entries.
     */
    @GetMapping("/events")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<List<CalendarEventResponse>> getCalendarEvents(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime endDate,
            @AuthenticationPrincipal User currentUser) {

        log.info("Calendar request from user: {} (ID: {})", currentUser.getEmail(), currentUser.getId());
        log.info("Date range: {} to {}", startDate, endDate);

        try {
            List<CalendarEventResponse> calendarEvents = new ArrayList<>();
            LocalDate startLocalDate = startDate.toLocalDate();
            LocalDate endLocalDate = endDate.toLocalDate();
            List<Availability> availabilities = availabilityService.getAvailabilitiesByHostAndDateRange(
                    currentUser.getId(), startLocalDate, endLocalDate);

            log.info("Found {} availability slots", availabilities.size());

            availabilities.forEach(availability -> {
                ZonedDateTime eventStart = LocalDateTime.of(availability.getDate(), availability.getStartTime())
                        .atZone(ZoneId.systemDefault());
                ZonedDateTime eventEnd = LocalDateTime.of(availability.getDate(), availability.getEndTime())
                        .atZone(ZoneId.systemDefault());

                CalendarEventResponse eventDTO = CalendarEventResponse.builder()
                        .id(availability.getId())
                        .title(availability.getExperience().getTitle())
                        .startTime(eventStart)
                        .endTime(eventEnd)
                        .type("experience")
                        .description(String.format("Available slots: %d | Duration: %d min",
                                availability.getCapacity(),
                                availability.getExperience().getDurationInMinutes()))
                        .experienceId(availability.getExperience().getId())
                        .build();
                calendarEvents.add(eventDTO);
            });

            List<PersonalScheduleEntry> personalEntries = personalScheduleService
                    .getPersonalEntriesByHostAndDateRange(currentUser.getId(), startDate, endDate);

            log.info("Found {} personal entries", personalEntries.size());

            personalEntries.forEach(entry -> {
                CalendarEventResponse eventDTO = CalendarEventResponse.builder()
                        .id(entry.getId())
                        .title(entry.getTitle())
                        .startTime(entry.getStartTime())
                        .endTime(entry.getEndTime())
                        .type("personal")
                        .description(entry.getDescription())
                        .build();
                calendarEvents.add(eventDTO);
            });

            log.info("Returning {} total events", calendarEvents.size());
            return ResponseEntity.ok(calendarEvents);

        } catch (Exception e) {
            log.error("Error fetching calendar events for user {}: {}", currentUser.getId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new personal schedule entry for the authenticated host.
     */
    @PostMapping("/personal-schedule")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<?> createPersonalScheduleEntry(
            @Valid @RequestBody PersonalScheduleRequest request,
            @AuthenticationPrincipal User currentUser) {

        log.info("Creating personal schedule entry for user: {} - {}",
                currentUser.getEmail(), request.getTitle());
        try {
            PersonalScheduleEntry created = personalScheduleService.createPersonalEntry(
                    currentUser.getId(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Error creating personal schedule entry for user {}: {}",
                    currentUser.getId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error occurred");
        }
    }

    /**
     * Get personal schedule entries only for management purposes.
     */
    @GetMapping("/personal-schedule")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<List<PersonalScheduleEntry>> getPersonalSchedule(
            @AuthenticationPrincipal User currentUser) {

        log.info("Fetching personal schedule for user: {}", currentUser.getEmail());
        try {
            List<PersonalScheduleEntry> entries = personalScheduleService
                    .getAllPersonalEntriesByHost(currentUser.getId());
            return ResponseEntity.ok(entries);
        } catch (Exception e) {
            log.error("Error fetching personal schedule for user {}: {}",
                    currentUser.getId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a personal schedule entry.
     */
    @DeleteMapping("/personal-schedule/{entryId}")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<?> deletePersonalScheduleEntry(
            @PathVariable Long entryId,
            @AuthenticationPrincipal User currentUser) {

        log.info("Deleting personal schedule entry {} for user: {}", entryId, currentUser.getEmail());
        try {
            personalScheduleService.deletePersonalEntry(entryId, currentUser.getId());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Personal schedule entry not found");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only delete your own personal schedule entries");
        } catch (Exception e) {
            log.error("Error deleting personal schedule entry {} for user {}: {}",
                    entryId, currentUser.getId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error occurred");
        }
    }

    /**
     * Check if a time slot is available (no conflicts with personal schedule).
     */
    @GetMapping("/availability-check")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<Boolean> checkTimeSlotAvailability(
            @RequestParam("startTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime startTime,
            @RequestParam("endTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime endTime,
            @AuthenticationPrincipal User currentUser) {

        log.debug("Checking time slot availability for user {} from {} to {}",
                currentUser.getId(), startTime, endTime);
        try {
            boolean isAvailable = personalScheduleService.isTimeSlotAvailable(
                    currentUser.getId(), startTime, endTime);
            return ResponseEntity.ok(isAvailable);
        } catch (Exception e) {
            log.error("Error checking time slot availability for user {}: {}",
                    currentUser.getId(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}