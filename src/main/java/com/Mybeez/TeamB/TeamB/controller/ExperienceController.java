package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.ExperienceCategory;
import com.Mybeez.TeamB.TeamB.model.ExperienceStatus;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.ExperienceEditResponse;
import com.Mybeez.TeamB.TeamB.payload.ExperienceRequest;

import com.Mybeez.TeamB.TeamB.payload.ExperienceDTO;
import com.Mybeez.TeamB.TeamB.service.ExperienceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// Standardized base path for the API
@RequestMapping("/api/experiences")
public class ExperienceController {

    private final ExperienceService experienceService;

    // Using constructor injection is a best practice over @Autowired
    public ExperienceController(ExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    // @GetMapping
    // public ResponseEntity<List<ExperienceDTO>> getAllExperiences() {
    // return ResponseEntity.ok(experienceService.getAllExperiences());
    // }

    /**
     * This single endpoint handles both getting all experiences and filtering them.
     * If no query parameters are provided, it returns all experiences.
     * If query parameters are provided, it returns a filtered list.
     */
    @GetMapping
    public ResponseEntity<List<ExperienceDTO>> getExperiences(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String sessionType,
            @RequestParam(required = false) Integer minDuration,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(required = false) Integer minGroupPrice,
            @RequestParam(required = false) Integer maxGroupPrice) {
        List<ExperienceDTO> experiences = experienceService.filterExperiences(
                keyword, categoryId, location, sessionType, minDuration, maxDuration, minGroupPrice, maxGroupPrice);
        return ResponseEntity.ok(experiences);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExperienceDTO> getExperienceById(@PathVariable Long id) {
        return ResponseEntity.ok(experienceService.getExperienceById(id));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ExperienceDTO>> getFeaturedExperiences() {
        return ResponseEntity.ok(experienceService.getFeaturedExperiences());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<ExperienceCategory>> getAllCategories() {
        List<ExperienceCategory> categories = experienceService.getAllCategories();
        return ResponseEntity.ok(categories);
    }


    @GetMapping("/filter-experiences")
    public ResponseEntity<List<ExperienceDTO>> filterExperiences(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String sessionType,
            @RequestParam(required = false) Integer minDuration,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(required = false) Integer minGroupPrice,
            @RequestParam(required = false) Integer maxGroupPrice) {

        List<ExperienceDTO> dtos = experienceService.filterExperiences(
                keyword, categoryId, location, sessionType, minDuration, maxDuration, minGroupPrice, maxGroupPrice);

        return ResponseEntity.ok(dtos);
    }

    // --- HOST-SPECIFIC, PROTECTED ENDPOINTS ---

    @PostMapping
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<Experience> createExperience(
            @Valid @RequestBody ExperienceRequest request,
            @AuthenticationPrincipal User user // Inject the custom User object directly
    ) {
        // Use the ID from the authenticated user, not a hardcoded value
        Experience createdExperience = experienceService.createExperience(request, user.getId());
        return new ResponseEntity<>(createdExperience, HttpStatus.CREATED);
    }

    @GetMapping("/my-experiences")
    public ResponseEntity<List<ExperienceDTO>> getMyExperiences(@AuthenticationPrincipal User user) {
        // Use the ID from the authenticated user
        List<ExperienceDTO> experiences = experienceService.getExperiencesByHost(user.getId());
        return ResponseEntity.ok(experiences);
    }

    @GetMapping("/host-experiences")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<List<ExperienceDTO>> getMyHostExperiences(
            @AuthenticationPrincipal User user,
            @RequestParam(name = "status", required = false) ExperienceStatus status) {
        List<ExperienceDTO> experiences;
        if (status != null) {
            // If status is provided, filter by it
            experiences = experienceService.getExperiencesByHostAndStatus(user.getId(), status);
        } else {
            // Otherwise, get all experiences for the host
            experiences = experienceService.getExperiencesByHost(user.getId());
        }
        return ResponseEntity.ok(experiences);
    }

    @GetMapping("/host/{id}")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ExperienceEditResponse> getExperienceForHost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user
    ) {
        System.out.println("=== DEBUG INFO ===");
        System.out.println("Requested experience ID: " + id);
        System.out.println("Current user ID from token: " + user.getId());
        System.out.println("Current user email: " + user.getEmail());

        try {
            ExperienceEditResponse dto = experienceService.getExperienceByIdForHost(id, user.getId());
            System.out.println("Success: Experience found and user authorized");
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            throw e;
        }
    }

    @PutMapping("/host/{id}")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ExperienceEditResponse> updateExperienceForHost(
            @PathVariable Long id,
            @Valid @RequestBody ExperienceRequest request,
            @AuthenticationPrincipal User user
    ) {
        System.out.println("=== UPDATE DEBUG INFO ===");
        System.out.println("Updating experience ID: " + id);
        System.out.println("Current user ID from token: " + user.getId());
        System.out.println("Current user email: " + user.getEmail());

        try {
            ExperienceEditResponse updatedExperience = experienceService.updateExperienceForHost(id, request, user.getId());
            System.out.println("Success: Experience updated");
            return ResponseEntity.ok(updatedExperience);
        } catch (Exception e) {
            System.out.println("Error: " + e.getMessage());
            throw e;
        }
    }
}