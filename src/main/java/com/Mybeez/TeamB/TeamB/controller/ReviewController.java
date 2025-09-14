package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.Review;
import com.Mybeez.TeamB.TeamB.model.ReviewStatus;
import com.Mybeez.TeamB.TeamB.payload.ReviewCreateDTO;
import com.Mybeez.TeamB.TeamB.repository.ExperienceRepository;
import com.Mybeez.TeamB.TeamB.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;


@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepo;

    @Autowired
    private ExperienceRepository experienceRepo;

    @PostMapping
    public ResponseEntity<Review> addReview(@RequestBody ReviewCreateDTO dto) {
        if (dto.getExperienceId() == null) {
            return ResponseEntity.badRequest().build();
        }

        Experience exp = experienceRepo.findById(dto.getExperienceId())
                .orElse(null);
        if (exp == null) {
            return ResponseEntity.notFound().build();
        }

        Review review = new Review();
        review.setExperience(exp);
        review.setReviewerName(dto.getReviewerName());
        review.setRating(dto.getRating());
        review.setReviewText(dto.getReviewText());
        review.setStatus(ReviewStatus.PENDING);

        Review saved = reviewRepo.save(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    @GetMapping("/stats/{experienceId}")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long experienceId) {
        Double avg = reviewRepo.findAvgRatingByExperienceId(experienceId);
        Long count = reviewRepo.countApprovedByExperienceId(experienceId);

        double rounded = Math.round(((avg != null ? avg : 0d) * 10.0)) / 10.0;

        return ResponseEntity.ok(Map.of(
                "experienceId", experienceId,
                "avgRating", rounded,
                "count", count != null ? count : 0L
        ));
    }
}

