package com.Mybeez.TeamB.TeamB.payload;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {
    @NotNull
    private Integer availabilityId;

    @NotNull
    @Min(1)
    private Integer numberOfGuests;
}