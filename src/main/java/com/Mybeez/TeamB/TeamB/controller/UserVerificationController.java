package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.model.UserProfile;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import com.Mybeez.TeamB.TeamB.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verification")
public class UserVerificationController {

    @Autowired private UserRepository userRepository;
    @Autowired private UserProfileRepository userProfileRepository;

    @PostMapping("/submit-id")
    public ResponseEntity<?> submitIdForVerification(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserProfile userProfile = user.getUserProfile();

        // In prod real app, we would handle the file upload here, save the file to secure storage (e.g., S3),
        // and then save the URL in the database.
        // userProfile.setIdVerificationUrl(savedIdUrl);

        userProfile.setIdVerificationStatus("PENDING");
        userProfileRepository.save(userProfile);

        return ResponseEntity.ok("Your ID has been submitted for verification.");
    }
}
