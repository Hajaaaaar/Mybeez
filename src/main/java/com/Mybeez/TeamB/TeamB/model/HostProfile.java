package com.Mybeez.TeamB.TeamB.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "host_profiles")
public class HostProfile {
    @Id private Long id;
    @OneToOne(fetch = FetchType.LAZY) @MapsId @JoinColumn(name = "id") @JsonIgnore private User user;
    private String phoneNumber;
    private String companyName;
    @Column(columnDefinition = "TEXT") private String bio;
    private String profilePictureUrl;
    private String applicationStatus = "PENDING";
    private String idVerificationUrl;
    private String idVerificationStatus = "PENDING";
    private boolean agreedToTerms = false;
}