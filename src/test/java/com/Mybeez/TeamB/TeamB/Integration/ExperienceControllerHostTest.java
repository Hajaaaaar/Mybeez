package com.Mybeez.TeamB.TeamB.Integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.Mybeez.TeamB.TeamB.model.*;
import com.Mybeez.TeamB.TeamB.payload.AvailabilityRequest;
import com.Mybeez.TeamB.TeamB.payload.ExperienceRequest;
import com.Mybeez.TeamB.TeamB.payload.ImageRequest;
import com.Mybeez.TeamB.TeamB.payload.LocationRequest;
import com.Mybeez.TeamB.TeamB.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ExperienceControllerHostTest {

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        @Primary
        public UserDetailsService userDetailsService(UserRepository userRepository) {
            // Return your JPA User as the principal so @AuthenticationPrincipal User works
            return username -> userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        }
    }

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Autowired private WishlistRepository wishlistRepository;
    @Autowired private ExperienceRepository experienceRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ExperienceCategoryRepository categoryRepository;
    @Autowired private LocationRepository locationRepository;

    private User mainHost;
    private User otherHost;
    private Experience mainHostExperience;
    private ExperienceCategory category;

    @BeforeEach
    void setup() {
        // Clean in FK-safe order
        wishlistRepository.deleteAll();
        experienceRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();
        locationRepository.deleteAll();

        // Seed users (domain User implements UserDetails)
        mainHost = userRepository.save(User.builder()
                .email("mainhost@test.com").passwordHash("{noop}password")
                .role(UserRole.HOST).active(true).build());

        otherHost = userRepository.save(User.builder()
                .email("otherhost@test.com").passwordHash("{noop}password")
                .role(UserRole.HOST).active(true).build());

        userRepository.save(User.builder()
                .email("user@test.com").passwordHash("{noop}password")
                .role(UserRole.USER).active(true).build());

        // Category
        ExperienceCategory c = new ExperienceCategory();
        c.setName("Testing");
        category = categoryRepository.save(c);

        // Unsaved Location (brand new → OK with cascade PERSIST)
        Location loc = new Location();
        loc.setCity("Testville");
        loc.setAddress("Initial Address");
        loc.setPostcode("CF10 3AX");

        // Experience owned by mainHost
        mainHostExperience = Experience.builder()
                .title("Owned Experience")
                .status(ExperienceStatus.PENDING)
                .host(mainHost)
                .category(category)
                .location(loc) // will be cascaded on save
                .build();
        experienceRepository.save(mainHostExperience);
    }

    private ExperienceRequest createValidExperienceRequest() {
        LocationRequest locReq = new LocationRequest();
        locReq.setAddress("123 Valid St");
        locReq.setCity("Validville");
        locReq.setPostcode("V1 2AL");

        ImageRequest imageReq = new ImageRequest();
        imageReq.setUrl("http://example.com/valid-image.jpg");
        imageReq.setPublicId("public_id_123");

        AvailabilityRequest availabilityReq = new AvailabilityRequest();
        availabilityReq.setDate(LocalDate.now().plusDays(1).toString());
        availabilityReq.setStartTime("10:00");
        availabilityReq.setEndTime("12:00");
        availabilityReq.setCapacity(10);

        ExperienceRequest req = new ExperienceRequest();
        req.setTitle("Valid Experience");
        req.setDescription("A valid description.");
        req.setCategoryId(category.getId());
        req.setDurationInMinutes(120);
        req.setSessionTypes(Set.of(SessionType.GROUP));
        req.setLocationRequest(locReq);
        req.setAvailableSlots(List.of(availabilityReq));
        req.setImages(List.of(imageReq));
        // If your service requires pricing, add them here.
        // req.setGroupPricePerPerson(new BigDecimal("25.00"));
        // req.setPrivatePricePerSession(new BigDecimal("120.00"));
        return req;
    }

    // -------- Host-only endpoints (excluding GET /host/{id}) --------

    @Test
    @WithUserDetails(value = "mainhost@test.com",
            setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void getHostExperiences_asHost_shouldReturnOwnExperiences() throws Exception {
        mockMvc.perform(get("/api/experiences/host-experiences"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Owned Experience")));
    }

    @Test
    @WithUserDetails(value = "user@test.com",
            setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void getHostExperiences_asUser_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/experiences/host-experiences"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithUserDetails(value = "mainhost@test.com",
            setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void createExperience_asHost_shouldSucceed() throws Exception {
        ExperienceRequest request = createValidExperienceRequest();
        request.setTitle("New Experience by Host");

        mockMvc.perform(post("/api/experiences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithUserDetails(value = "user@test.com",
            setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void createExperience_asUser_shouldReturnForbidden() throws Exception {
        ExperienceRequest request = createValidExperienceRequest();
        request.setTitle("Unauthorized Experience");

        mockMvc.perform(post("/api/experiences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithUserDetails(value = "mainhost@test.com",
            setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void updateExperience_asOwner_shouldSucceed() throws Exception {
        ExperienceRequest request = createValidExperienceRequest();
        request.setTitle("Updated Title");

        mockMvc.perform(put("/api/experiences/host/" + mainHostExperience.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Updated Title")));
    }

    @Test
    @WithUserDetails(value = "otherhost@test.com",
            setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void updateExperience_asDifferentHost_shouldReturnForbidden() throws Exception {
        ExperienceRequest request = createValidExperienceRequest();
        request.setTitle("Attempted Update");

        mockMvc.perform(put("/api/experiences/host/" + mainHostExperience.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
