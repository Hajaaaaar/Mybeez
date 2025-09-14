package com.Mybeez.TeamB.TeamB.Integration;

import com.Mybeez.TeamB.TeamB.controller.ExperienceController;
import com.Mybeez.TeamB.TeamB.exception.ResourceNotFoundException;
import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.SessionType;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.*;
import com.Mybeez.TeamB.TeamB.security.JwtTokenProvider;
import com.Mybeez.TeamB.TeamB.service.ExperienceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = ExperienceController.class,
        excludeAutoConfiguration = UserDetailsServiceAutoConfiguration.class
)
@Import(com.Mybeez.TeamB.TeamB.Integration.TestSecurityConfig.class)
public class ExperienceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExperienceService experienceService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsService userDetailsService;

    private ExperienceDTO sampleExperienceDTO;
    private Experience sampleExperience;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        // Create a sample user that will be "logged in" for our tests
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setEmail("host@example.com");
        sampleUser.setPasswordHash("password"); // UserDetails needs a non-null password

        // Define the mock behavior for the UserDetailsService
        when(userDetailsService.loadUserByUsername("host@example.com")).thenReturn(sampleUser);

        sampleExperienceDTO = new ExperienceDTO();
        sampleExperienceDTO.setId(1L);
        sampleExperienceDTO.setTitle("Historic City Walking Tour");
        sampleExperienceDTO.setHost(new HostDTO(sampleUser));

        sampleExperience = new Experience();
        sampleExperience.setId(1L);
        sampleExperience.setTitle("New Artisan Pottery Class");
        sampleExperience.setHost(sampleUser);
    }

    @Test
    void whenGetExperienceById_andExperienceExists_thenReturns200OK() throws Exception {
        when(experienceService.getExperienceById(1L)).thenReturn(sampleExperienceDTO);

        mockMvc.perform(get("/api/experiences/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("Historic City Walking Tour")));
    }

    @Test
    void whenGetExperienceById_andExperienceNotFound_thenReturns404NotFound() throws Exception {
        when(experienceService.getExperienceById(99L)).thenThrow(new ResourceNotFoundException("Experience not found"));

        mockMvc.perform(get("/api/experiences/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "host@example.com", roles = {"HOST"})
    void whenCreateExperience_withInvalidData_thenReturns400BadRequest() throws Exception {
        ExperienceRequest invalidRequest = new ExperienceRequest();
        invalidRequest.setTitle("");
        invalidRequest.setDescription("A description.");

        mockMvc.perform(post("/api/experiences")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }



    @Test
    void whenGetExperiences_withCategoryFilter_thenReturnsFilteredList() throws Exception {
        // Arrange: Tell the mock service what to return for a specific filter
        when(experienceService.filterExperiences(
                null, 1L, null, null, null, null, null, null
        )).thenReturn(List.of(sampleExperienceDTO)); // Return a list with one item

        // Act, Assert: Perform the GET request with a query parameter
        mockMvc.perform(get("/api/experiences?categoryId=1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1))) // Check that the returned array has 1 item
                .andExpect(jsonPath("$[0].id", is(1))); // Check the ID of the first item
    }
}