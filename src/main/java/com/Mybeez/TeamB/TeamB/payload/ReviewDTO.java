package com.Mybeez.TeamB.TeamB.payload;

import lombok.Data;
import lombok.NoArgsConstructor; // Import NoArgsConstructor

@Data
@NoArgsConstructor // Add this to generate the default no-argument constructor
public class ReviewDTO {
    private Long id;
    private String reviewerName;
    private String experienceTitle;
    private String reviewText;
    private int rating;

    public ReviewDTO(String reviewerName, String reviewText, int rating) {
        this.reviewerName = reviewerName;
        this.reviewText = reviewText;
        this.rating = rating;
    }

}

