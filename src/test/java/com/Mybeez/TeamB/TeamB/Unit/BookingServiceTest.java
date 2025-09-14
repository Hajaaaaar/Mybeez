package com.Mybeez.TeamB.TeamB.Unit;


import com.Mybeez.TeamB.TeamB.exception.BookingException;
import com.Mybeez.TeamB.TeamB.model.*;
import com.Mybeez.TeamB.TeamB.payload.BookingRequest;
import com.Mybeez.TeamB.TeamB.repository.AvailabilityRepository;
import com.Mybeez.TeamB.TeamB.repository.BookingRepository;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import com.Mybeez.TeamB.TeamB.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;


@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private AvailabilityRepository availabilityRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    private User testUser;
    private Experience testExperience;
    private Availability groupSlot;
    private Availability privateSlot;

    @BeforeEach
    void setUp() {
        // Create mock data that we can control
        testUser = User.builder().id(1L).build();
        testExperience = Experience.builder()
                .id(1L)
                .groupPricePerPerson(new BigDecimal("25.00"))
                .privatePrice(new BigDecimal("120.00"))
                .build();

        groupSlot = Availability.builder()
                .id(101L)
                .experience(testExperience)
                .capacity(10)
                .build();

        privateSlot = Availability.builder()
                .id(102L)
                .experience(testExperience)
                .capacity(1)
                .build();
    }

    @Test
    void createBooking_shouldCalculateCorrectPrice_forGroupSession() {
        // Set up the test conditions
        BookingRequest request = new BookingRequest();
        request.setAvailabilityId(101);
        request.setNumberOfGuests(3);

        // Tell mock repositories what to return when they are called
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(availabilityRepository.findById(101)).thenReturn(Optional.of(groupSlot));
        when(bookingRepository.findTotalBookedGuestsForAvailabilityIds(any())).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Call the method we want to test
        Booking result = bookingService.createBooking(request, 1L);

        // Check if the result is what we expect
        assertNotNull(result);
        // 3 guests * £25.00/guest = £75.00
        assertEquals(new BigDecimal("75.00"), result.getTotalPrice());
        assertEquals(3, result.getNumberOfGuests());
    }

    @Test
    void createBooking_shouldCalculateCorrectPrice_forPrivateSession() {
        BookingRequest request = new BookingRequest();
        request.setAvailabilityId(102);
        request.setNumberOfGuests(1); // Guest count is 1 for private

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(availabilityRepository.findById(102)).thenReturn(Optional.of(privateSlot));
        when(bookingRepository.findTotalBookedGuestsForAvailabilityIds(any())).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));


        Booking result = bookingService.createBooking(request, 1L);


        assertNotNull(result);
        // Private session fee is £120.00
        assertEquals(new BigDecimal("120.00"), result.getTotalPrice());
        assertEquals(1, result.getNumberOfGuests());
    }

    @Test
    void createBooking_shouldThrowException_whenNotEnoughSpots() {
        BookingRequest request = new BookingRequest();
        request.setAvailabilityId(101);
        request.setNumberOfGuests(5); // Requesting 5 spots

        // Simulate that 8 spots are already booked
        List<Object[]> bookedResults = new java.util.ArrayList<>();
        bookedResults.add(new Object[]{101, 8L});

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(availabilityRepository.findById(101)).thenReturn(Optional.of(groupSlot));
        when(bookingRepository.findTotalBookedGuestsForAvailabilityIds(any())).thenReturn(bookedResults);

        // Check that the correct exception is thrown
        BookingException exception = assertThrows(BookingException.class, () -> {
            bookingService.createBooking(request, 1L);
        });

        assertEquals("Not enough spots available for this time slot.", exception.getMessage());
    }
}
