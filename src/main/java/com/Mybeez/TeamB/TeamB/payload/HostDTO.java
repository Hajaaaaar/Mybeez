package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.User; // ✅ Added import
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class HostDTO {
    private Long id;
    private String firstName;
    private String email;
    private String summary;
    private String profilePictureUrl;
    private String lastName;

    public HostDTO(User host) {
        if (host != null) {
            this.id = host.getId();
            this.firstName = host.getFirstName();
            this.email = host.getEmail();
            this.lastName = host.getLastName();
            this.summary = host.getSummary();
            this.profilePictureUrl = host.getProfilePictureUrl();
        }
    }
}