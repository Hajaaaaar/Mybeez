package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.model.UserProfile;
import com.Mybeez.TeamB.TeamB.payload.UserProfileUpdateRequest;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import com.Mybeez.TeamB.TeamB.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate; // Import LocalDate

@Service
public class UserProfileService {

    @Autowired private UserRepository userRepository;
    @Autowired private UserProfileRepository userProfileRepository;

    @Transactional
    public UserProfile updateUserProfile(String userEmail, UserProfileUpdateRequest updateRequest) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        UserProfile userProfile = user.getUserProfile();
        if (userProfile == null) {
            userProfile = new UserProfile();
            userProfile.setUser(user);
            user.setUserProfile(userProfile);
        }

        userProfile.setAboutMe(updateRequest.getAboutMe());
        userProfile.setLocation(updateRequest.getLocation());
        userProfile.setMobileNumber(updateRequest.getMobileNumber());
        userProfile.setAddress(updateRequest.getAddress());


        // Convert the String from the request into a LocalDate object for the database.
        if (updateRequest.getDateOfBirth() != null && !updateRequest.getDateOfBirth().isEmpty()) {
            userProfile.setDateOfBirth(LocalDate.parse(updateRequest.getDateOfBirth()));
        } else {
            userProfile.setDateOfBirth(null);
        }


        userProfile.setLinkedinProfileUrl(updateRequest.getLinkedinProfileUrl());
        userProfile.setInstagramProfileUrl(updateRequest.getInstagramProfileUrl());

        return userProfileRepository.save(userProfile);
    }
}
