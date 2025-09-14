package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.Review;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.HostDashboardDTO;
import com.Mybeez.TeamB.TeamB.payload.ReviewDTO;
import com.Mybeez.TeamB.TeamB.payload.HostDTO;
import com.Mybeez.TeamB.TeamB.repository.BookingRepository;
import com.Mybeez.TeamB.TeamB.repository.ExperienceRepository;
import com.Mybeez.TeamB.TeamB.repository.ReviewRepository;
import com.Mybeez.TeamB.TeamB.repository.UserRepository; // Import UserRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HostDashboardService {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private ExperienceRepository experienceRepository;
    @Autowired private UserRepository userRepository;

    @Transactional(readOnly = true)
    public HostDashboardDTO getDashboardData(User currentUser) {

        User host = userRepository.findByEmailWithExperiences(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Host not found"));

        HostDashboardDTO dto = new HostDashboardDTO();   // declare once

        dto.setHost(new HostDTO(host));

        LocalDateTime startOfMonth = LocalDateTime.now().with(TemporalAdjusters.firstDayOfMonth());

        dto.setUpcomingBookings(bookingRepository.countUpcomingBookingsForHost(host.getId()));
        dto.setPendingRequests(bookingRepository.countPendingRequestsForHost(host.getId()));

        BigDecimal totalEarnings = bookingRepository.findTotalEarningsForMonth(host.getId(), startOfMonth);
        dto.setTotalEarningsMonth(totalEarnings != null ? totalEarnings : BigDecimal.ZERO);

        double averageRating = host.getExperiences().stream()
                .filter(e -> e.getRating() != null)
                .mapToDouble(Experience::getRating)
                .average()
                .orElse(0.0);
        dto.setOverallRating(Math.round(averageRating * 10.0) / 10.0);

        Optional<Experience> mostPopular = experienceRepository.findMostPopularExperienceForHost(host.getId());
        dto.setMostPopularExperience(mostPopular.map(Experience::getTitle).orElse("N/A"));

        List<Review> recentReviews = reviewRepository.findFirst3ByExperience_Host_IdOrderByCreatedAtDesc(host.getId());
        List<ReviewDTO> reviewDTOs = recentReviews.stream()
                .map(review -> {
                    ReviewDTO reviewDto = new ReviewDTO();
                    reviewDto.setId(review.getId());
                    reviewDto.setReviewerName(review.getReviewerName());
                    reviewDto.setExperienceTitle(review.getExperience().getTitle());
                    reviewDto.setReviewText(review.getReviewText());
                    reviewDto.setRating(review.getRating());
                    return reviewDto;
                })
                .collect(Collectors.toList());
        dto.setRecentReviews(reviewDTOs);

        dto.setUnreadMessages(3L);

        return dto;
    }
}
