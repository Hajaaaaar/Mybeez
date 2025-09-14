package com.Mybeez.TeamB.TeamB.repository;

import com.Mybeez.TeamB.TeamB.model.Booking;
import com.Mybeez.TeamB.TeamB.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Calculates the sum of all confirmed guests for a list of availability IDs.
     * It performs the calculation in the database.
     *
     * @param availabilityIds A list of IDs for the time slots.
     * @return A list of objects where each object contains [availabilityId, totalBookedGuests].
     */
    @Query("SELECT b.availability.id, SUM(b.numberOfGuests) " +
            "FROM Booking b " +
            "WHERE b.availability.id IN :availabilityIds AND b.status = 'CONFIRMED' " +
            "GROUP BY b.availability.id")
    List<Object[]> findTotalBookedGuestsForAvailabilityIds(List<Long> availabilityIds);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);



    List<Booking> findByAvailability_Experience_Host_IdAndStatus(Long hostId, BookingStatus status);


    @Query("SELECT COUNT(b) FROM Booking b WHERE b.availability.experience.host.id = :hostId AND b.availability.date >= CURRENT_DATE")
    long countUpcomingBookingsForHost(@Param("hostId") Long hostId);

    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.availability.experience.host.id = :hostId AND b.createdAt >= :startOfMonth")
    BigDecimal findTotalEarningsForMonth(@Param("hostId") Long hostId, @Param("startOfMonth") LocalDateTime startOfMonth);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.availability.experience.host.id = :hostId AND b.status = 'PENDING'")
    long countPendingRequestsForHost(@Param("hostId") Long hostId);
}