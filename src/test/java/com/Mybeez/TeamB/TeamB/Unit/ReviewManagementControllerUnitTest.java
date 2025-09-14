package com.Mybeez.TeamB.TeamB.Unit;

import com.Mybeez.TeamB.TeamB.controller.ReviewManagementController;
import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.Review;
import com.Mybeez.TeamB.TeamB.model.ReviewStatus;
import com.Mybeez.TeamB.TeamB.repository.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewManagementControllerUnitTest {

    @Mock
    ReviewRepository reviewRepository;

    @InjectMocks
    ReviewManagementController controller;

    private Review pendingReview(Long id) {
        Review r = new Review();
        r.setId(id);
        r.setReviewerName("Bob");
        r.setRating(4);
        r.setReviewText("Pretty good!");
        r.setStatus(ReviewStatus.PENDING);
        Experience e = new Experience();
        e.setId(10L);
        r.setExperience(e);
        return r;
    }

    @Test
    void approveReview_setsStatusApproved_andSaves() {
        // Given
        Review r = pendingReview(5L);
        when(reviewRepository.findById(5L)).thenReturn(Optional.of(r));

        // When
        ResponseEntity<String> resp = controller.approveReview(5L);

        // Then
        assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(resp.getBody()).isEqualTo("Review approved");
        assertThat(r.getStatus()).isEqualTo(ReviewStatus.APPROVED);

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(ReviewStatus.APPROVED);
    }

    @Test
    void rejectReview_setsStatusRejected_andSaves() {
        // Given
        Review r = pendingReview(6L);
        when(reviewRepository.findById(6L)).thenReturn(Optional.of(r));

        // When
        ResponseEntity<String> resp = controller.rejectReview(6L);

        // Then
        assertThat(resp.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(resp.getBody()).isEqualTo("Review rejected");
        assertThat(r.getStatus()).isEqualTo(ReviewStatus.REJECTED);

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(ReviewStatus.REJECTED);
    }

    @Test
    void approveReview_returns404_whenMissing() {
        when(reviewRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<String> resp = controller.approveReview(99L);

        assertThat(resp.getStatusCodeValue()).isEqualTo(404);
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void rejectReview_returns404_whenMissing() {
        when(reviewRepository.findById(98L)).thenReturn(Optional.empty());

        ResponseEntity<String> resp = controller.rejectReview(98L);

        assertThat(resp.getStatusCodeValue()).isEqualTo(404);
        verify(reviewRepository, never()).save(any());
    }
}
