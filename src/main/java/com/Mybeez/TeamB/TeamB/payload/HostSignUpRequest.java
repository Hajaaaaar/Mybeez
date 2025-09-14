package com.Mybeez.TeamB.TeamB.payload;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class HostSignUpRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    private String companyName; // Optional

    @NotBlank(message = "Bio is required")
    @Size(min = 50, message = "Bio must be at least 50 characters long")
    private String bio;

    @AssertTrue(message = "You must agree to the terms")
    private boolean agreedToTerms;
}
