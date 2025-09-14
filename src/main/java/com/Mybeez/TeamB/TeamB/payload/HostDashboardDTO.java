package com.Mybeez.TeamB.TeamB.payload;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class HostDashboardDTO {
    private HostDTO host;
    // Data for the main stat cards
    private long upcomingBookings;
    private long unreadMessages;
    private BigDecimal totalEarningsMonth;
    private double overallRating;
    private String mostPopularExperience;
    private long pendingRequests;

    // Data for the recent reviews feed
    private List<ReviewDTO> recentReviews;
}