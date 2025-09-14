package com.Mybeez.TeamB.TeamB.Integration;


import com.Mybeez.TeamB.TeamB.model.Availability;
import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.repository.AvailabilityRepository;
import com.Mybeez.TeamB.TeamB.repository.BookingRepository;
import com.Mybeez.TeamB.TeamB.repository.ExperienceRepository;
import com.Mybeez.TeamB.TeamB.service.EncryptionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AvailabilityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExperienceRepository experienceRepository;
    @MockBean
    private AvailabilityRepository availabilityRepository;
    @MockBean
    private BookingRepository bookingRepository;
    @MockBean
    private EncryptionService encryptionService;


    @Test
    void getGroupAvailability_shouldReturnCorrectSlots_withoutDatabase() throws Exception {
        // Create the mock data that our repositories will return
        Long experienceId = 1L;
        LocalDate testDate = LocalDate.now().plusDays(1);

        Experience mockExperience = Experience.builder()
                .id(experienceId)
                .groupPricePerPerson(new BigDecimal("50.00"))
                .build();

        Availability mockGroupSlot = Availability.builder()
                .id(101L)
                .date(testDate)
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(12, 0))
                .capacity(10)
                .build();

        // Define the behavior of the mock repositories
        when(experienceRepository.findById(experienceId)).thenReturn(Optional.of(mockExperience));
        when(availabilityRepository.findByExperienceIdAndCapacityGreaterThan(experienceId, 1)).thenReturn(List.of(mockGroupSlot));
        // Assume no one has booked this slot yet
        when(bookingRepository.findTotalBookedGuestsForAvailabilityIds(any())).thenReturn(List.of());

        // Perform the API call
        mockMvc.perform(get("/api/availability/" + experienceId + "/group"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.groupPricePerPerson", is(50.00)))
                .andExpect(jsonPath("$.availableDates", hasSize(1)))
                .andExpect(jsonPath("$.availableDates[0].date", is(testDate.toString())))
                .andExpect(jsonPath("$.availableDates[0].slots", hasSize(1)))
                .andExpect(jsonPath("$.availableDates[0].slots[0].spotsLeft", is(10)));
    }
}
