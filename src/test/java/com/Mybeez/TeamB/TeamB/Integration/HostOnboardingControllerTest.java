package com.Mybeez.TeamB.TeamB.Integration;

import com.Mybeez.TeamB.TeamB.payload.HostSignUpRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class HostOnboardingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void submitHostApplication_shouldReturnBadRequest_whenBioIsTooShort() throws Exception {
        HostSignUpRequest request = new HostSignUpRequest();
        request.setFirstName("Test");
        request.setLastName("User");
        request.setEmail("newhost@example.com");
        request.setPassword("password123");
        request.setPhoneNumber("1234567890");
        request.setBio("Too short");
        request.setAgreedToTerms(true);

        mockMvc.perform(post("/api/host-onboarding/submit-application")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.bio").value("Bio must be at least 50 characters long"));
    }
}
