package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.payload.DailyAvailabilityDTO;
import com.Mybeez.TeamB.TeamB.payload.GroupAvailabilityResponse;
import com.Mybeez.TeamB.TeamB.payload.SlotDTO;
import com.Mybeez.TeamB.TeamB.model.Availability;
import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.repository.AvailabilityRepository;
import com.Mybeez.TeamB.TeamB.repository.BookingRepository;
import com.Mybeez.TeamB.TeamB.repository.ExperienceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AvailabilityService {

    @Autowired
    private ExperienceRepository experienceRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Transactional(readOnly = true)
    public GroupAvailabilityResponse getGroupAvailability(Long experienceId) {
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new EntityNotFoundException("Experience not found: " + experienceId));
        List<Availability> futureSlots = availabilityRepository.findByExperienceIdAndCapacityGreaterThan(experienceId, 1)
                .stream()
                .filter(slot -> !slot.getDate().isBefore(LocalDate.now()))
                .toList();
        return createAvailabilityResponse(experience.getGroupPricePerPerson(), futureSlots);
    }

    @Transactional(readOnly = true)
    public GroupAvailabilityResponse getPrivateAvailability(Long experienceId) {
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new EntityNotFoundException("Experience not found: " + experienceId));
        List<Availability> privateSlots = availabilityRepository.findByExperienceIdAndCapacity(experienceId, 1)
                .stream()
                .filter(slot -> !slot.getDate().isBefore(LocalDate.now()))
                .toList();
        return createAvailabilityResponse(experience.getPrivatePrice(), privateSlots);
    }

    private GroupAvailabilityResponse createAvailabilityResponse(BigDecimal price, List<Availability> slots) {
        if (slots.isEmpty()) {
            return new GroupAvailabilityResponse(price, List.of());
        }

        List<Long> availabilityIds = slots.stream().map(Availability::getId).toList();
        Map<Long, Long> bookedGuestsMap = bookingRepository.findTotalBookedGuestsForAvailabilityIds(availabilityIds)
                .stream()
                .collect(Collectors.toMap(obj -> (Long) obj[0], obj -> (Long) obj[1]));


        List<SlotDTO> slotDTOs = slots.stream()
                .map(slot -> {
                    int bookedGuests = bookedGuestsMap.getOrDefault(slot.getId(), 0L).intValue();
                    int spotsLeft = slot.getCapacity() - bookedGuests;
                    return new SlotDTO(slot.getId(), slot.getStartTime(), slot.getEndTime(), spotsLeft);
                })
                .collect(Collectors.toList());

        Map<LocalDate, List<SlotDTO>> slotsByDate = slotDTOs.stream()
                .collect(Collectors.groupingBy(
                        slotDTO -> slots.stream()
                                .filter(av -> av.getId().equals(slotDTO.availabilityId()))
                                .findFirst()
                                .map(Availability::getDate)
                                .orElse(null)
                ));

        List<DailyAvailabilityDTO> dailyList = slotsByDate.entrySet().stream()
                .filter(entry -> entry.getKey() != null)
                .map(entry -> new DailyAvailabilityDTO(entry.getKey(), entry.getValue()))
                .sorted((d1, d2) -> d1.date().compareTo(d2.date()))
                .collect(Collectors.toList());

        return new GroupAvailabilityResponse(price, dailyList);
    }

    /**
     * Get availability slots for a host within a date range (for calendar view)
     * This fetches all availability slots for experiences owned by the host
     */
    @Transactional(readOnly = true)
    public List<Availability> getAvailabilitiesByHostAndDateRange(
            Long hostId, LocalDate startDate, LocalDate endDate) {

//        log.info("DEBUG: Searching availability for hostId: {} from {} to {}", hostId, startDate, endDate);

        List<Availability> result = availabilityRepository.findByExperienceHostIdAndDateBetween(
                hostId, startDate, endDate);

//        log.info("DEBUG: Spring query returned {} availability slots", result.size());

        // Test a simple query to see if the relationship works
        List<Availability> allForHost = availabilityRepository.findAll().stream()
                .filter(a -> a.getExperience().getHost().getId().equals(hostId))
                .collect(Collectors.toList());

//        log.info("DEBUG: Manual filter found {} availability slots", allForHost.size());

        return result;
    }

//    /**
//     * Get all availability slots for a specific host
//     */
//    @Transactional(readOnly = true)
//    public List<Availability> getAllAvailabilitiesByHost(Long hostId) {
////        log.debug("Fetching all availability slots for host {}", hostId);
//        return availabilityRepository.findByExperienceHostIdOrderByDateAsc(hostId);
//    }
//
//    /**
//     * Get availability slots for a specific experience (extended from your existing pattern)
//     */
//    @Transactional(readOnly = true)
//    public List<Availability> getAvailabilitiesByExperience(Long experienceId) {
////        log.debug("Fetching availability slots for experience {}", experienceId);
//        return availabilityRepository.findByExperienceIdOrderByDateAsc(experienceId);
//    }
//
//    /**
//     * Get availability slots for a specific date
//     */
//    @Transactional(readOnly = true)
//    public List<Availability> getAvailabilitiesByHostAndDate(Long hostId, LocalDate date) {
////        log.debug("Fetching availability slots for host {} on date {}", hostId, date);
//        return availabilityRepository.findByExperienceHostIdAndDate(hostId, date);
//    }
//
//    /**
//     * Check for overlapping availability slots
//     */
//    @Transactional(readOnly = true)
//    public List<Availability> findOverlappingAvailability(Long hostId, LocalDate date,
//                                                          LocalTime startTime, LocalTime endTime) {
////        log.debug("Checking for overlapping availability for host {} on {} from {} to {}",
//                hostId, date, startTime, endTime);
//
//        return availabilityRepository.findOverlappingAvailability(hostId, date, startTime, endTime);
//    }
//
//    /**
//     * Get upcoming availability slots for a host (next 30 days)
//     */
//    @Transactional(readOnly = true)
//    public List<Availability> getUpcomingAvailabilities(Long hostId) {
////        LocalDate endDate = LocalDate.now().plusDays(30);
//        log.debug("Fetching upcoming availability slots for host {} until {}", hostId, endDate);
//
//        return availabilityRepository.findUpcomingAvailability(hostId, endDate);
//    }
//
//    /**
//     * Count availability slots for a host on a specific date
//     */
//    @Transactional(readOnly = true)
//    public long countAvailabilitySlots(Long hostId, LocalDate date) {
//        return availabilityRepository.countByExperienceHostIdAndDate(hostId, date);
//    }
//
//    /**
//     * Check if a host has any availability slots on a specific date
//     */
//    @Transactional(readOnly = true)
//    public boolean hasAvailabilityOnDate(Long hostId, LocalDate date) {
//        return countAvailabilitySlots(hostId, date) > 0;
//    }
//
//    /**
//     * Check if a specific time slot conflicts with existing availability
//     */
//    @Transactional(readOnly = true)
//    public boolean hasTimeConflict(Long hostId, LocalDate date, LocalTime startTime, LocalTime endTime) {
//        List<Availability> overlapping = findOverlappingAvailability(hostId, date, startTime, endTime);
//        return !overlapping.isEmpty();
//    }
}