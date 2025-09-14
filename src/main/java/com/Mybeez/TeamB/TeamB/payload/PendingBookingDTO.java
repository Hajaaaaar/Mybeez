package com.Mybeez.TeamB.TeamB.payload;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO for representing a pending booking request.
 * This class is used to prevent infinite recursion during JSON serialization
 * and to send only the necessary data to the frontend modal.
 */
@Data
public class PendingBookingDTO {
    private Long id;
    private String experienceTitle;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private int numberOfGuests;
    private BigDecimal totalPrice;
}
