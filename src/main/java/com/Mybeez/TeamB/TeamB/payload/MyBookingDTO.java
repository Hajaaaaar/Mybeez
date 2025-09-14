package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.Booking;
import lombok.Getter;
import lombok.Setter;

import java.time.format.DateTimeFormatter;

@Getter
@Setter
public class MyBookingDTO {
    private Long bookingId;
    private Integer numberOfGuests;
    private String bookingDate;
    private String bookingTime;
    private ExperienceDTO experience;

    public MyBookingDTO(Booking booking) {
        this.bookingId = booking.getId();
        this.numberOfGuests = booking.getNumberOfGuests();
        // Format date and time for easy display on the frontend
        this.bookingDate = booking.getAvailability().getDate().format(DateTimeFormatter.ofPattern("EEE, d MMM yyyy"));
        this.bookingTime = booking.getAvailability().getStartTime().format(DateTimeFormatter.ofPattern("HH:mm"));
        this.experience = new ExperienceDTO(booking.getAvailability().getExperience());
    }
}