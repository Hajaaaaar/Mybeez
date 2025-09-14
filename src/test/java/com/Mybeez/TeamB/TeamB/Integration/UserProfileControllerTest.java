package com.Mybeez.TeamB.TeamB.Integration;

import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.model.UserProfile;
import com.Mybeez.TeamB.TeamB.model.UserRole;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class UserProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "profileuser@example.com", roles = "USER")
    void getMyProfile_shouldReturnProfile_whenUserIsAuthenticated() throws Exception {
        User user = new User();
        user.setEmail("profileuser@example.com");
        user.setPasswordHash("password");
        user.setRole(UserRole.USER);
        user.setActive(true);

        UserProfile profile = new UserProfile();
        profile.setLocation("Cardiff");
        user.setUserProfile(profile);
        profile.setUser(user);

        userRepository.save(user);

        mockMvc.perform(get("/api/profile/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("profileuser@example.com"))
                .andExpect(jsonPath("$.userProfile.location").value("Cardiff"));
    }

    @Test
    void getMyProfile_shouldReturnUnauthorized_whenUserIsNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/profile/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "updateuser@example.com", roles = "USER")
    void updateMyProfile_shouldUpdateAndReturnProfile() throws Exception {
        User user = new User();
        user.setEmail("updateuser@example.com");
        user.setPasswordHash("password");
        user.setRole(UserRole.USER);
        user.setActive(true);

        UserProfile profile = new UserProfile();
        user.setUserProfile(profile);
        profile.setUser(user);
        userRepository.save(user);

        UserProfile updateRequest = new UserProfile();
        updateRequest.setAboutMe("This is my new bio.");
        updateRequest.setLinkedinProfileUrl("https://linkedin.com/in/test");

        mockMvc.perform(put("/api/profile/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.aboutMe").value("This is my new bio."))
                .andExpect(jsonPath("$.linkedinProfileUrl").value("https://linkedin.com/in/test"));
    }
}
