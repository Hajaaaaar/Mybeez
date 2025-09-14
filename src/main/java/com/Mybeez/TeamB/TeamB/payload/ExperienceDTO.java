package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.Image;
import com.Mybeez.TeamB.TeamB.model.Review;
import com.Mybeez.TeamB.TeamB.model.SessionType;
import com.Mybeez.TeamB.TeamB.model.ReviewStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.OptionalDouble;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class ExperienceDTO {

    private Long id;
    private String title;
    private String description;
    private String category;
    private HostDTO host;
    private String location;
    private Integer durationInMinutes;
    private Double rating;
    private BigDecimal groupPricePerPerson;
    private BigDecimal privatePrice;
    private List<String> images;
    private List<String> sessionTypes;
    private List<String> tags;
    private List<ReviewDTO> reviews;


    public ExperienceDTO(Experience e) {
        this.id = e.getId();
        this.title = e.getTitle();
        this.description = e.getDescription();
        this.host = new HostDTO(e.getHost());
        this.category = e.getCategory() != null ? e.getCategory().getName() : "Uncategorized";
        this.durationInMinutes = e.getDurationInMinutes();
        this.groupPricePerPerson = e.getGroupPricePerPerson();
        this.privatePrice = e.getPrivatePrice();

        // 1. Calculate the live average rating from the 'reviews' list on the Experience object
        if (e.getReviews() != null) {
            OptionalDouble average = e.getReviews().stream()
                    // Filter to include only APPROVED reviews
                    .filter(review -> review.getStatus() == ReviewStatus.APPROVED)
                    // Map each review object to its integer rating
                    .mapToInt(Review::getRating)
                    // Calculate the average
                    .average();

            // Set the rating if an average was calculated, otherwise leave it null
            this.rating = average.isPresent() ? average.getAsDouble() : null;
        } else {
            this.rating = null;
        }


        // 2. Map the Location object to a simple string (e.g., the city).
        if (e.getLocation() != null) {
            this.location = e.getLocation().getAddress();
        }

        // 3. Map the collections, handling potential nulls.
        if (e.getSessionTypes() != null) {
            this.sessionTypes = e.getSessionTypes().stream()
                    .map(SessionType::name)
                    .collect(Collectors.toList());
        } else {
            this.sessionTypes = new ArrayList<>();
        }

        if (e.getTags() != null) {
            this.tags = new ArrayList<>(e.getTags());
        } else {
            this.tags = new ArrayList<>();
        }

        if (e.getImages() != null) {
            this.images = e.getImages().stream()
                    .map(Image::getUrl)
                    .collect(Collectors.toList());
        } else {
            this.images = new ArrayList<>();
        }

        if (e.getReviews() != null) {
            this.reviews = e.getReviews().stream()
                    .filter(review -> review.getStatus() == ReviewStatus.APPROVED)

                    .sorted(Comparator.comparing(Review::getCreatedAt).reversed())
                    .map(r -> new ReviewDTO(r.getReviewerName(), r.getReviewText(), r.getRating()))
                    .collect(Collectors.toList());
        } else {
            this.reviews = new ArrayList<>();
        }
    }
}