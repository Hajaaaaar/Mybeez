package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.Booking;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.BookingRequest;
import com.Mybeez.TeamB.TeamB.payload.MyBookingDTO;
import com.Mybeez.TeamB.TeamB.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @Valid @RequestBody BookingRequest bookingRequest,
            @AuthenticationPrincipal User currentUser
    ) {
        Booking booking = bookingService.createBooking(bookingRequest, currentUser.getId());
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MyBookingDTO>> getMyBookings(@AuthenticationPrincipal User currentUser) {
        List<MyBookingDTO> bookings = bookingService.getBookingsForUser(currentUser.getId());
        return ResponseEntity.ok(bookings);
    }
}