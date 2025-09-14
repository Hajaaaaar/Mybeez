package com.Mybeez.TeamB.TeamB.Integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class CloudinaryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "HOST")
    void getUploadSignature_asHost_shouldSucceed() throws Exception {
        mockMvc.perform(post("/api/cloudinary/sign"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.signature").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @WithMockUser(roles = "USER")
    void getUploadSignature_asUser_shouldReturnForbidden() throws Exception {
        mockMvc.perform(post("/api/cloudinary/sign"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "HOST")
    void getDeleteSignature_asHost_shouldSucceed() throws Exception {
        Map<String, String> requestBody = Map.of("publicId", "test_public_id");

        mockMvc.perform(post("/api/cloudinary/delete-sign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.signature").exists())
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @WithMockUser(roles = "USER")
    void getDeleteSignature_asUser_shouldReturnForbidden() throws Exception {
        Map<String, String> requestBody = Map.of("publicId", "test_public_id");

        mockMvc.perform(post("/api/cloudinary/delete-sign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isForbidden());
    }
}