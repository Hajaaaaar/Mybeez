package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.ReviewStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewManagementDTO {
    private Long id;
    private String reviewerName;
    private Long experienceId;
    private int rating;
    private String reviewText;
    private LocalDateTime createdAt;
    private ReviewStatus status;

    public ReviewManagementDTO(Long id, String reviewerName, Long experienceId, int rating, String reviewText, LocalDateTime createdAt, ReviewStatus status) {
        this.id = id;
        this.reviewerName = reviewerName;
        this.experienceId = experienceId;
        this.rating = rating;
        this.reviewText = reviewText;
        this.createdAt = createdAt;
        this.status = status;
    }
}
