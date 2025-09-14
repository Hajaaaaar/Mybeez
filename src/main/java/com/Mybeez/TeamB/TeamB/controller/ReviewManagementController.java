package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.Review;
import com.Mybeez.TeamB.TeamB.model.ReviewStatus;
import com.Mybeez.TeamB.TeamB.payload.ReviewManagementDTO;
import com.Mybeez.TeamB.TeamB.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
public class ReviewManagementController {

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping
    public Page<ReviewManagementDTO> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> reviewsPage = reviewRepository.findAll(pageable);

        return reviewsPage.map(r -> new ReviewManagementDTO(
                r.getId(),
                r.getReviewerName(),
                r.getExperience() != null ? r.getExperience().getId() : null,
                r.getRating(),
                r.getReviewText(),
                r.getCreatedAt(),
                r.getStatus()
        ));
    }

    @GetMapping("/pending")
    public Page<ReviewManagementDTO> getPendingReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> pendingReviews = reviewRepository.findByStatus(ReviewStatus.PENDING, pageable);

        return pendingReviews.map(r -> new ReviewManagementDTO(
                r.getId(),
                r.getReviewerName(),
                r.getExperience() != null ? r.getExperience().getId() : null,
                r.getRating(),
                r.getReviewText(),
                r.getCreatedAt(),
                r.getStatus()
        ));
    }

    @GetMapping("/approved")
    public Page<ReviewManagementDTO> getApprovedReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> approvedReviews = reviewRepository.findByStatus(ReviewStatus.APPROVED, pageable);

        return approvedReviews.map(r -> new ReviewManagementDTO(
                r.getId(),
                r.getReviewerName(),
                r.getExperience() != null ? r.getExperience().getId() : null,
                r.getRating(),
                r.getReviewText(),
                r.getCreatedAt(),
                r.getStatus()
        ));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveReview(@PathVariable Long id) {
        return reviewRepository.findById(id)
                .map(review -> {
                    review.setStatus(ReviewStatus.APPROVED);
                    reviewRepository.save(review);
                    return ResponseEntity.ok("Review approved");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<String> rejectReview(@PathVariable Long id) {
        return reviewRepository.findById(id)
                .map(review -> {
                    review.setStatus(ReviewStatus.REJECTED);
                    reviewRepository.save(review);
                    return ResponseEntity.ok("Review rejected");
                })
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/rejected")
    public Page<ReviewManagementDTO> getRejectedReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Review> rejectedReviews = reviewRepository.findByStatus(ReviewStatus.REJECTED, pageable);

        return rejectedReviews.map(r -> new ReviewManagementDTO(
                r.getId(),
                r.getReviewerName(),
                r.getExperience() != null ? r.getExperience().getId() : null,
                r.getRating(),
                r.getReviewText(),
                r.getCreatedAt(),
                r.getStatus()
        ));
    }

}
