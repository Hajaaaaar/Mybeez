package com.Mybeez.TeamB.TeamB.payload;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvailabilityRequest {
    @NotBlank(message = "Date is required for each slot")
    private String date;

    @NotBlank(message = "Start time is required for each slot")
    private String startTime;

    @NotBlank(message = "End time is required for each slot")
    private String endTime;

    @NotNull(message = "Capacity is required for each slot")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
}