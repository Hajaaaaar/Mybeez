package com.Mybeez.TeamB.TeamB.repository;

import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.ExperienceStatus;

import com.Mybeez.TeamB.TeamB.payload.ExperienceDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long>, JpaSpecificationExecutor<Experience> {


    @Query("SELECT e FROM Experience e WHERE LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Experience> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT e FROM Experience e JOIN FETCH e.host h WHERE e.id = :id")
    Optional<Experience> findByIdWithHost(@Param("id") Long id);

    List<ExperienceDTO> findByHostId(Long hostId);

    List<ExperienceDTO> findByHostIdAndStatus(Long hostId, ExperienceStatus status);

    @Query("SELECT e FROM Experience e LEFT JOIN FETCH e.availability WHERE e.id = :id")
    Optional<Experience> findByIdWithAvailability(@Param("id") Long id);

    List<Experience> findByStatus(ExperienceStatus status);

    @Query("SELECT b.availability.experience FROM Booking b WHERE b.availability.experience.host.id = :hostId GROUP BY b.availability.experience ORDER BY COUNT(b) DESC LIMIT 1")
    Optional<Experience> findMostPopularExperienceForHost(@Param("hostId") Long hostId);

    List<Experience> findByOrderByRatingDesc(Pageable pageable);
}
