package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.ExperienceDTO;
import com.Mybeez.TeamB.TeamB.payload.ExperienceRejectionRequest;
import com.Mybeez.TeamB.TeamB.exception.UserNotFoundException;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.model.UserRole;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import com.Mybeez.TeamB.TeamB.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminService adminService;

    @PostMapping("/approve-host/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveHostApplication(@PathVariable Long userId) {
        // --- THIS IS THE FIX ---
        // Use the new, specific exception when the user is not found.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        // --- END OF FIX ---

        user.setRole(UserRole.HOST);
        user.setActive(true);

        userRepository.save(user);

        return ResponseEntity.ok("Host application approved and user enabled.");
    }


    @GetMapping("/experiences/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ExperienceDTO>> getPendingExperiences() {
        List<Experience> experiences = adminService.getPendingExperiences();
        List<ExperienceDTO> dtos = experiences.stream().map(ExperienceDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/experiences/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExperienceDTO> approveExperience(@PathVariable Long id) {
        Experience experience = adminService.approveExperience(id);
        return ResponseEntity.ok(new ExperienceDTO(experience));
    }

    @PostMapping("/experiences/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExperienceDTO> rejectExperience(
            @PathVariable Long id,
            @Valid @RequestBody ExperienceRejectionRequest request
    ) {
        Experience experience = adminService.rejectExperience(id, request.getReason());
        return ResponseEntity.ok(new ExperienceDTO(experience));
    }
    
}
