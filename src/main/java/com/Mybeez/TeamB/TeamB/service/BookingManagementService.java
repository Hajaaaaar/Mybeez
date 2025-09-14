package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.exception.ResourceNotFoundException;
import com.Mybeez.TeamB.TeamB.model.Booking;
import com.Mybeez.TeamB.TeamB.model.BookingStatus;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.PendingBookingDTO;
import com.Mybeez.TeamB.TeamB.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingManagementService {

    @Autowired
    private BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public List<PendingBookingDTO> getPendingBookings(User host) {
        List<Booking> bookings = bookingRepository.findByAvailability_Experience_Host_IdAndStatus(host.getId(), BookingStatus.PENDING);

        // Map the Booking entities to the new PendingBookingDTO
        return bookings.stream().map(booking -> {
            PendingBookingDTO dto = new PendingBookingDTO();
            dto.setId(booking.getId());
            dto.setExperienceTitle(booking.getAvailability().getExperience().getTitle());
            dto.setBookingDate(booking.getAvailability().getDate());
            dto.setStartTime(booking.getAvailability().getStartTime());
            dto.setEndTime(booking.getAvailability().getEndTime());
            dto.setNumberOfGuests(booking.getNumberOfGuests());
            dto.setTotalPrice(booking.getTotalPrice());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public Booking approveBooking(Long bookingId, User host) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getAvailability().getExperience().getHost().getId().equals(host.getId())) {
            throw new AccessDeniedException("You are not authorized to manage this booking.");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking rejectBooking(Long bookingId, User host) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getAvailability().getExperience().getHost().getId().equals(host.getId())) {
            throw new AccessDeniedException("You are not authorized to manage this booking.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
