package com.Mybeez.TeamB.TeamB.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    @JsonIgnore
    private User user;


    private String location;
    @Column(columnDefinition = "TEXT")
    private String aboutMe;
    private String mobileNumber;
    private String address;
    private LocalDate dateOfBirth;
    private String profilePictureUrl;
    private String linkedinProfileUrl;
    private String instagramProfileUrl;

    // --- Fields for User-specific ID Verification ---
    private String idVerificationUrl;
    private String idVerificationStatus = "NOT_SUBMITTED"; // e.g., NOT_SUBMITTED, PENDING, VERIFIED
}
