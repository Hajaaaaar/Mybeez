package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.exception.BookingException;
import com.Mybeez.TeamB.TeamB.model.*;
import com.Mybeez.TeamB.TeamB.payload.BookingRequest;
import com.Mybeez.TeamB.TeamB.payload.MyBookingDTO;
import com.Mybeez.TeamB.TeamB.repository.AvailabilityRepository;
import com.Mybeez.TeamB.TeamB.repository.BookingRepository;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired private BookingRepository bookingRepository;
    @Autowired private AvailabilityRepository availabilityRepository;
    @Autowired private UserRepository userRepository;

    @Transactional
    public Booking createBooking(BookingRequest request, Long userId) {
        // Find the entities needed
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Availability availability = availabilityRepository.findById(request.getAvailabilityId())
                .orElseThrow(() -> new EntityNotFoundException("Availability slot not found"));

        // Check for booking conflicts (core validation)
        int requestedGuests = request.getNumberOfGuests();
        List<Object[]> bookedResult = bookingRepository.findTotalBookedGuestsForAvailabilityIds(List.of(availability.getId()));

        long alreadyBooked = 0;
        if (!bookedResult.isEmpty()) {
            alreadyBooked = (long) bookedResult.get(0)[1];
        }

        if (availability.getCapacity() < alreadyBooked + requestedGuests) {
            throw new BookingException("Not enough spots available for this time slot.");
        }

        // Calculate total price
        BigDecimal totalPrice;
        if (availability.getCapacity() == 1) {
            totalPrice = availability.getExperience().getPrivatePrice();
        } else { //group session
            BigDecimal pricePerPerson = availability.getExperience().getGroupPricePerPerson();
            totalPrice = pricePerPerson.multiply(new BigDecimal(requestedGuests));
        }

        // Create and save the booking
        Booking newBooking = Booking.builder()
                .user(user)
                .availability(availability)
                .numberOfGuests(requestedGuests)
                .totalPrice(totalPrice)
                .status(BookingStatus.CONFIRMED)
                .build();

        return bookingRepository.save(newBooking);
    }

    @Transactional(readOnly = true)
    public List<MyBookingDTO> getBookingsForUser(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(MyBookingDTO::new)
                .collect(Collectors.toList());
    }
}