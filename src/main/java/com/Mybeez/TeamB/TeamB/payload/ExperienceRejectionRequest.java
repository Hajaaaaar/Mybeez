package com.Mybeez.TeamB.TeamB.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExperienceRejectionRequest {
    @NotBlank(message = "A reason for rejection is required.")
    private String reason;
}