package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.Booking;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.PendingBookingDTO;
import com.Mybeez.TeamB.TeamB.service.BookingManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/host/bookings")
@PreAuthorize("hasRole('HOST')")
public class BookingManagementController {

    @Autowired
    private BookingManagementService bookingManagementService;

    @GetMapping("/pending")
    public ResponseEntity<List<PendingBookingDTO>> getPendingBookings(@AuthenticationPrincipal User currentUser) {
        List<PendingBookingDTO> pendingBookings = bookingManagementService.getPendingBookings(currentUser);
        return ResponseEntity.ok(pendingBookings);
    }

    @PutMapping("/{bookingId}/approve")
    public ResponseEntity<Booking> approveBooking(@PathVariable Long bookingId, @AuthenticationPrincipal User currentUser) {
        Booking approvedBooking = bookingManagementService.approveBooking(bookingId, currentUser);
        return ResponseEntity.ok(approvedBooking);
    }

    @PutMapping("/{bookingId}/reject")
    public ResponseEntity<Booking> rejectBooking(@PathVariable Long bookingId, @AuthenticationPrincipal User currentUser) {
        Booking rejectedBooking = bookingManagementService.rejectBooking(bookingId, currentUser);
        return ResponseEntity.ok(rejectedBooking);
    }
}
