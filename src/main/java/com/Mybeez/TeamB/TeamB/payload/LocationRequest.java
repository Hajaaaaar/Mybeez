package com.Mybeez.TeamB.TeamB.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LocationRequest {

    @NotBlank(message = "Address cannot be blank")
    private String address;

//    @NotBlank(message = "City cannot be blank")
    private String city;

//    @NotBlank(message = "Postcode cannot be blank")
    private String postcode;

    }
