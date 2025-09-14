package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.HostProfile;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.model.UserRole;
import com.Mybeez.TeamB.TeamB.payload.HostSignUpRequest;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/host-onboarding")
public class HostOnboardingController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/submit-application")
    public ResponseEntity<?> submitHostApplication(@Valid @RequestBody HostSignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.HOST);
        user.setActive(false);


        HostProfile hostProfile = new HostProfile();
        hostProfile.setPhoneNumber(request.getPhoneNumber());
        hostProfile.setCompanyName(request.getCompanyName());
        hostProfile.setBio(request.getBio());
        hostProfile.setAgreedToTerms(request.isAgreedToTerms());

        user.setHostProfile(hostProfile);
        hostProfile.setUser(user);

        userRepository.save(user);

        return ResponseEntity.ok("Host application submitted successfully!");
    }
}
