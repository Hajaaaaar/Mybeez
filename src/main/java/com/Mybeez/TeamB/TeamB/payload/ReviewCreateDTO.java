// src/main/java/.../payload/ReviewCreateDTO.java
package com.Mybeez.TeamB.TeamB.payload;

import lombok.Data;

@Data
public class ReviewCreateDTO {
    private Long experienceId;
    private String reviewerName;
    private int rating;
    private String reviewText;
}
