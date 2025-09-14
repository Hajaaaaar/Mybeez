package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.SessionType;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class ExperienceEditResponse {
    // All fields needed to pre-populate the entire multi-step form
    private Long id;
    private String title;
    private String description;
    private Integer durationInMinutes;
    private Set<SessionType> sessionTypes;
    private BigDecimal groupPricePerPerson;
    private BigDecimal privatePrice;
    private Set<String> tags;

    private CategoryResponse category;
    private LocationResponse location;
    private HostDTO host;
    private List<AvailabilityResponse> availability;
    private List<ImageResponse> images;

    public ExperienceEditResponse(Experience exp) {
        this.id = exp.getId();
        this.title = exp.getTitle();
        this.description = exp.getDescription();
        this.durationInMinutes = exp.getDurationInMinutes();
        this.sessionTypes = exp.getSessionTypes();
        this.groupPricePerPerson = exp.getGroupPricePerPerson();
        this.privatePrice = exp.getPrivatePrice();
        this.tags = exp.getTags();

        if (exp.getCategory() != null) {
            this.category = new CategoryResponse(exp.getCategory());
        }
        if (exp.getLocation() != null) {
            this.location = new LocationResponse(exp.getLocation());
        }
        if (exp.getHost() != null) {
            this.host = new HostDTO(exp.getHost());
        }
        if (exp.getAvailability() != null) {
            this.availability = exp.getAvailability().stream()
                    .map(AvailabilityResponse::new)
                    .collect(Collectors.toList());
        }
        if (exp.getImages() != null) {
            this.images = exp.getImages().stream()
                    .map(ImageResponse::new)
                    .collect(Collectors.toList());
        }
    }
}