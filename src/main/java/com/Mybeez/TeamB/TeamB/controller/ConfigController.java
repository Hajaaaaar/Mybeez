package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.payload.ValidationConfigDTO;
import com.Mybeez.TeamB.TeamB.service.ContentValidationService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    private List<String> bannedWords = new ArrayList<>();
    private final ResourceLoader resourceLoader;

    // Inject Spring's ResourceLoader
    public ConfigController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    // This method runs after the bean is created and loads the words
    @PostConstruct
    public void init() {
        try {
            // Load the file from the classpath
            Resource resource = resourceLoader.getResource("classpath:profanity-list.txt");
            String content = resource.getContentAsString(StandardCharsets.UTF_8);
            // Split the comma-separated string into a list
            if (content != null && !content.trim().isEmpty()) {
                this.bannedWords = Arrays.asList(content.split(","));
            }
        } catch (IOException e) {
            // Log the error or handle it as you see fit
            System.err.println("Error loading profanity list: " + e.getMessage());
        }
    }

    @GetMapping("/validation")
    public ResponseEntity<ValidationConfigDTO> getValidationConfig() {
        ValidationConfigDTO config = new ValidationConfigDTO(
                bannedWords,
                ContentValidationService.EMAIL_REGEX_STRING,
                ContentValidationService.PHONE_REGEX_STRING
        );
        return ResponseEntity.ok(config);
    }
}