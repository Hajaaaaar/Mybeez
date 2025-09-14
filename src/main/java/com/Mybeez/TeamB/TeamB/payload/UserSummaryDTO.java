package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.User;
import lombok.Data;

// A lightweight DTO to represent a user in a conversation list
@Data
public class UserSummaryDTO {
    private Long id;
    private String firstName;
    private String profilePictureUrl;

    public UserSummaryDTO(User user) {
        this.id = user.getId();
        this.firstName = user.getFirstName();
        this.profilePictureUrl = user.getProfilePictureUrl();
    }
}