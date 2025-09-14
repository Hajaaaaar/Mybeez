package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.SessionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class ExperienceRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @Valid // This annotation tells Spring to validate the nested object
    @NotNull(message = "Location data is required")
    private LocationRequest locationRequest;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationInMinutes;

    @NotEmpty(message = "At least one session type must be selected")
    private Set<SessionType> sessionTypes;
    
    @Min(value = 0, message = "Group price must be 0 or more")
    private BigDecimal groupPricePerPerson;
    
    @Min(value = 0, message = "Private price must be 0 or more")
    private BigDecimal privatePrice;

    @Min(value = 1, message = "Minimum group attendees must be at least 1")
    private Integer groupMinAttendees;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @Valid
    @NotEmpty(message = "At least one image is required")
    private List<ImageRequest> images;
    
    @Valid 
    @NotEmpty(message = "At least one available slot is required")
    private List<AvailabilityRequest> availableSlots;

    private Set<String> tags;
}

