package com.Mybeez.TeamB.TeamB.repository;

import com.Mybeez.TeamB.TeamB.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.Mybeez.TeamB.TeamB.model.ReviewStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByExperienceId(Long experienceId);

    List<Review> findFirst3ByExperience_Host_IdOrderByCreatedAtDesc(Long hostId);



    Page<Review> findByStatus(ReviewStatus status, Pageable pageable);
    @Query("""
        SELECT COALESCE(AVG(r.rating), 0)
        FROM Review r
        WHERE r.experience.id = :experienceId AND r.status = com.Mybeez.TeamB.TeamB.model.ReviewStatus.APPROVED
    """)
    Double findAvgRatingByExperienceId(@Param("experienceId") Long experienceId);

    @Query("""
        SELECT COUNT(r)
        FROM Review r
        WHERE r.experience.id = :experienceId AND r.status = com.Mybeez.TeamB.TeamB.model.ReviewStatus.APPROVED
    """)
    Long countApprovedByExperienceId(@Param("experienceId") Long experienceId);

    /**
     * Finds the IDs of experiences ordered by their average approved rating in descending order
     * This query is used to determine the "featured" experiences for the homepage
     *
     * @param pageable Used to limit the number of results (e.g., top 3)
     * @return A list of Experience IDs (Long)
     */
    @Query("""
        SELECT r.experience.id
        FROM Review r
        WHERE r.status = com.Mybeez.TeamB.TeamB.model.ReviewStatus.APPROVED
        GROUP BY r.experience.id
        ORDER BY AVG(r.rating) DESC
    """)
    List<Long> findTopRatedExperienceIds(Pageable pageable);

}

