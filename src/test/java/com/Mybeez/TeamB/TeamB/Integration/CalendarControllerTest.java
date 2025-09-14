package com.Mybeez.TeamB.TeamB.Integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.model.UserRole;
import com.Mybeez.TeamB.TeamB.payload.PersonalScheduleRequest;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.ZonedDateTime;

import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CalendarControllerTest {

    @TestConfiguration
    static class TestSecurityConfig {
        /**
         * Make Spring Security load our JPA User as the principal so
         * @AuthenticationPrincipal User currentUser works without changing the controller.
         */
        @Bean
        @Primary
        public UserDetailsService userDetailsService(UserRepository userRepository) {
            return username -> userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        }
    }

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;

    private User host;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();
        host = User.builder()
                .email("host@test.com")
                .passwordHash("{noop}password") // important for DelegatingPasswordEncoder
                .role(UserRole.HOST)
                .active(true)                    // must be enabled per User#isEnabled()
                .build();
        userRepository.save(host);
    }

    @Test
    @WithUserDetails(value = "host@test.com", setupBefore = TEST_EXECUTION)
    void createPersonalScheduleEntry_asHost_shouldSucceed() throws Exception {
        PersonalScheduleRequest request = new PersonalScheduleRequest();
        request.setTitle("My Personal Event");
        request.setStartTime(ZonedDateTime.now().plusHours(1));
        request.setEndTime(ZonedDateTime.now().plusHours(2));

        mockMvc.perform(post("/api/calendar/personal-schedule")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("My Personal Event")));
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void createPersonalScheduleEntry_asUser_shouldReturnForbidden() throws Exception {
        PersonalScheduleRequest request = new PersonalScheduleRequest();
        request.setTitle("Unauthorized Event");
        request.setStartTime(ZonedDateTime.now().plusHours(1));
        request.setEndTime(ZonedDateTime.now().plusHours(2));

        mockMvc.perform(post("/api/calendar/personal-schedule")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithUserDetails(value = "host@test.com", setupBefore = TEST_EXECUTION)
    void getCalendarEvents_asHost_shouldSucceed() throws Exception {
        mockMvc.perform(get("/api/calendar/events")
                        .param("startDate", ZonedDateTime.now().minusDays(1).toString())
                        .param("endDate", ZonedDateTime.now().plusDays(1).toString()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void getCalendarEvents_asUser_shouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/calendar/events")
                        .param("startDate", ZonedDateTime.now().minusDays(1).toString())
                        .param("endDate", ZonedDateTime.now().plusDays(1).toString()))
                .andExpect(status().isForbidden());
    }
}
