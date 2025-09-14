package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.User;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String summary;
    private String profilePictureUrl;
    private LocalDateTime registrationDate;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserDTO(User user) {
        if (user != null) {
            this.id = user.getId();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
            this.email = user.getEmail();
            this.role = user.getRole() != null ? user.getRole().name() : null;
            this.summary = user.getSummary();
            this.profilePictureUrl = user.getProfilePictureUrl();
            this.registrationDate = user.getRegistrationDate();
            this.active = user.isActive();
            this.createdAt = user.getCreatedAt();
            this.updatedAt = user.getUpdatedAt();
        }
    }
}
