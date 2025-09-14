package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.model.UserProfile;
import com.Mybeez.TeamB.TeamB.payload.UserProfileUpdateRequest;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import com.Mybeez.TeamB.TeamB.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    @Autowired private UserRepository userRepository;
    @Autowired private UserProfileService userProfileService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfile> updateCurrentUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserProfileUpdateRequest profileUpdateRequest) {

        UserProfile updatedProfile = userProfileService.updateUserProfile(userDetails.getUsername(), profileUpdateRequest);
        return ResponseEntity.ok(updatedProfile);
    }
}
