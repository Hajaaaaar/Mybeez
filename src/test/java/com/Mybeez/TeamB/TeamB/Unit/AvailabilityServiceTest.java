package com.Mybeez.TeamB.TeamB.Unit;

import com.Mybeez.TeamB.TeamB.model.Availability;
import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.repository.AvailabilityRepository;
import com.Mybeez.TeamB.TeamB.service.AvailabilityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AvailabilityServiceTest {

    // The @Mock annotation creates a fake version of the repository.
    @Mock
    private AvailabilityRepository availabilityRepository;

    // The @InjectMocks annotation creates an instance of AvailabilityService
    // and injects the mocks (like availabilityRepository) into it.
    @InjectMocks
    private AvailabilityService availabilityService;

    private User host;
    private Experience experience;
    private Availability availabilityInDateRange;
    private LocalDate startDate;
    private LocalDate endDate;

    @BeforeEach
    void setUp() {
        // --- Common test data setup ---
        host = new User();
        host.setId(1L);

        experience = new Experience();
        experience.setHost(host);

        startDate = LocalDate.of(2025, 8, 1);
        endDate = LocalDate.of(2025, 8, 31);

        availabilityInDateRange = new Availability();
        availabilityInDateRange.setDate(LocalDate.of(2025, 8, 15));
        availabilityInDateRange.setExperience(experience);
    }

    /**
     * Test case for the main success path.
     * Verifies that the service returns a list of availabilities when the repository
     * finds matching data for the given host and date range.
     */
    @Test
    void whenAvailabilitiesExist_getAvailabilitiesByHostAndDateRange_shouldReturnList() {
        // Arrange: Configure the mock repository to return a list with one item
        when(availabilityRepository.findByExperienceHostIdAndDateBetween(host.getId(), startDate, endDate))
                .thenReturn(List.of(availabilityInDateRange));

        // Act: Call the service method we are testing
        List<Availability> result = availabilityService.getAvailabilitiesByHostAndDateRange(host.getId(), startDate, endDate);

        // Assert: Check that the result is correct
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(availabilityInDateRange, result.get(0));

        // Verify that the repository method was called exactly once with the correct parameters
        verify(availabilityRepository, times(1)).findByExperienceHostIdAndDateBetween(host.getId(), startDate, endDate);
    }

    /**
     * Test case for when no availabilities exist in the specified range.
     * Verifies that the service correctly returns an empty list.
     */
    @Test
    void whenNoAvailabilitiesExist_getAvailabilitiesByHostAndDateRange_shouldReturnEmptyList() {
        // Arrange: Configure the mock repository to return an empty list
        when(availabilityRepository.findByExperienceHostIdAndDateBetween(host.getId(), startDate, endDate))
                .thenReturn(Collections.emptyList());

        // Act: Call the service method
        List<Availability> result = availabilityService.getAvailabilitiesByHostAndDateRange(host.getId(), startDate, endDate);

        // Assert: Check that the result is an empty list
        assertNotNull(result);
        assertTrue(result.isEmpty());

        // Verify the repository method was called
        verify(availabilityRepository, times(1)).findByExperienceHostIdAndDateBetween(host.getId(), startDate, endDate);
    }

    /**
     * Test case to ensure a host only sees their own availability slots.
     * Verifies that if data exists for a different host, an empty list is returned for the current host.
     */
    @Test
    void whenAvailabilitiesExistForDifferentHost_getAvailabilitiesByHostAndDateRange_shouldReturnEmptyList() {
        Long otherHostId = 2L;

        // Arrange: Configure the mock to return an empty list for the requested host ID
        when(availabilityRepository.findByExperienceHostIdAndDateBetween(otherHostId, startDate, endDate))
                .thenReturn(Collections.emptyList());

        // Act: Call the service method with a different host ID
        List<Availability> result = availabilityService.getAvailabilitiesByHostAndDateRange(otherHostId, startDate, endDate);

        // Assert: Ensure the result is empty
        assertNotNull(result);
        assertTrue(result.isEmpty());

        // Verify the repository was called with the correct (other) host ID
        verify(availabilityRepository, times(1)).findByExperienceHostIdAndDateBetween(otherHostId, startDate, endDate);
    }
}