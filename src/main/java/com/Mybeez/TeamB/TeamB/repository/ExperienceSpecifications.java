package com.Mybeez.TeamB.TeamB.repository;

import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.ExperienceStatus;
import com.Mybeez.TeamB.TeamB.model.SessionType;
import org.springframework.data.jpa.domain.Specification;

public class ExperienceSpecifications {
    /**
     * Creates a specification to filter experiences by their status.
     * This is used to ensure public searches only return APPROVED experiences.
     * @param status The ExperienceStatus to filter by.
     * @return A Specification for the query.
     */
    public static Specification<Experience> hasStatus(ExperienceStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Experience> hasCategory(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return cb.conjunction();
            return cb.equal(root.join("category").get("id"), categoryId);
        };
    }

    public static Specification<Experience> hasLocation(String location) {
        return (root, query, cb) -> {
            if (location == null || location.isEmpty()) return cb.conjunction();
            return cb.like(cb.lower(root.join("location").get("city")), "%" + location.toLowerCase() + "%");
        };
    }

    public static Specification<Experience> hasSessionType(String sessionType) {
        return (root, query, cb) -> {
            if (sessionType == null || sessionType.isEmpty()) return cb.conjunction();
            try {
                SessionType sessionTypeEnum = SessionType.valueOf(sessionType.toUpperCase());
                return cb.isMember(sessionTypeEnum, root.get("sessionTypes"));
            } catch (IllegalArgumentException e) {
                return cb.disjunction(); // invalid enum value
            }
        };
    }

    public static Specification<Experience> hasMinDuration(Integer minDuration) {
        return (root, query, cb) -> {
            if (minDuration == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("durationInMinutes"), minDuration);
        };
    }

    public static Specification<Experience> hasMaxDuration(Integer maxDuration) {
        return (root, query, cb) -> {
            if (maxDuration == null) return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("durationInMinutes"), maxDuration);
        };
    }

    public static Specification<Experience> hasMinGroupPrice(Integer minPrice) {
        return (root, query, cb) -> {
            if (minPrice == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("groupPricePerPerson"), minPrice);
        };
    }

    public static Specification<Experience> hasMaxGroupPrice(Integer maxPrice) {
        return (root, query, cb) -> {
            if (maxPrice == null) return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("groupPricePerPerson"), maxPrice);
        };
    }

    public static Specification<Experience> hasKeyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.trim().isEmpty()) return cb.conjunction();
            String likePattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), likePattern),
                    cb.like(cb.lower(root.get("description")), likePattern)
            );
        };
    }
}
