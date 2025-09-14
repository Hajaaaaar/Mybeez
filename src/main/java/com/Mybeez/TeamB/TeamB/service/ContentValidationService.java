package com.Mybeez.TeamB.TeamB.service;

import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ContentValidationService {

    // This list will be populated from the text file
    private List<String> bannedWords = new ArrayList<>();

    // Regex patterns
    public static final String EMAIL_REGEX_STRING = "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b";
    public static final String PHONE_REGEX_STRING = "(?:\\+?\\d{1,3}[-.\s]?)?(?:\\(\\d{1,4}\\)|\\d{1,4})[-.\s]?\\d{1,4}[-.\\s]?\\d{1,9}";

    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX_STRING);
    private static final Pattern PHONE_PATTERN = Pattern.compile(PHONE_REGEX_STRING);


     // Loads the words from profanity-list.txt
    @PostConstruct
    public void loadBannedWords() {
        try {
            // Use ClassPathResource to reliably find the file in the classpath
            ClassPathResource resource = new ClassPathResource("profanity-list.txt");
            InputStream inputStream = resource.getInputStream();

            // Read the file line by line and collect the words into our list
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                this.bannedWords = reader.lines()
                        .map(String::trim) // Remove leading/trailing whitespace
                        .filter(line -> !line.isEmpty())
                        .collect(Collectors.toList());
            }
        } catch (IOException e) {
            // Log an error if the file can't be found or read
            System.err.println("Error loading banned words file: " + e.getMessage());
        }
    }

    /**
     * Public getter so other services (like ConfigController) can access the list.
     */
    public List<String> getBannedWords() {
        return this.bannedWords;
    }

    // The isContentInvalid method remains exactly the same
    public boolean isContentInvalid(String content) {
        if (content == null || content.isBlank()) { return false; }
        String lowerCaseContent = content.toLowerCase();
        for (String bannedWord : bannedWords) {
            if (lowerCaseContent.contains(bannedWord.toLowerCase())) { return true; }
        }
        if (EMAIL_PATTERN.matcher(content).find()) { return true; }
        if (PHONE_PATTERN.matcher(content).find()) { return true; }
        return false;
    }
}