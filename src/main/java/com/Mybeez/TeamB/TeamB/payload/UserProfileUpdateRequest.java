package com.Mybeez.TeamB.TeamB.payload;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;
import lombok.Data;

@Data
public class UserProfileUpdateRequest {

    @Size(max = 50)
    private String location;

    @Size(max = 1000)
    private String aboutMe;

    @Size(max = 20)
    private String mobileNumber;

    @Size(max = 255)
    private String address;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date of birth must be in YYYY-MM-DD format")
    private String dateOfBirth; // Keep this as a String to accept frontend data

    @URL(message = "Please provide a valid LinkedIn URL")
    private String linkedinProfileUrl;

    @URL(message = "Please provide a valid Instagram URL")
    private String instagramProfileUrl;
}
