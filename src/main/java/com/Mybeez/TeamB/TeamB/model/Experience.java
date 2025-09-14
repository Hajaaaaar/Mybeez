package com.Mybeez.TeamB.TeamB.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@Table(name = "experiences")
public class Experience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // --- Experience Details ---
    @Column(name = "duration_in_minutes")
    private Integer durationInMinutes;

    @Column(name = "rating")
    private Double rating;

    @Enumerated(EnumType.STRING)
    private ExperienceStatus status;

    // --- Pricing (Using BigDecimal for accuracy) ---
    @Column(name = "group_price_per_person")
    private BigDecimal groupPricePerPerson;

    @Column(name = "private_price_per_session")
    private BigDecimal privatePrice;

    // --- Collections and Enums ---
    @ElementCollection(targetClass = SessionType.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "experience_session_types", joinColumns = @JoinColumn(name = "experience_id"))
    @Column(name = "session_type")
    private Set<SessionType> sessionTypes;

    @ElementCollection
    @CollectionTable(name = "experience_tags", joinColumns = @JoinColumn(name = "experience_id"))
    @Column(name = "tag")
    private Set<String> tags;

    // --- Relationships ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ExperienceCategory category;

    // This is the new, normalized relationship to the Location entity
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "location_id")
    private Location location;

    @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("experience-availability")
    private List<Availability> availability;

//    @Column(name = "image_url")
//    private String imageUrl;

    @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("experience-images")
    private List<Image> images;

    @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("experience-reviews")
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();

    @OneToOne(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Rejection rejection;

    // --- Timestamps ---
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- Lifecycle Callbacks for Timestamps ---
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // --- Helper Methods for managing relationships ---
    public void addAvailability(Availability availability) {
        if (this.availability == null) {
            this.availability = new ArrayList<>();
        }
        this.availability.add(availability);
        availability.setExperience(this);
    }

    public void addImage(Image image) {
        if (this.images == null) {
            this.images = new ArrayList<>();
        }
        this.images.add(image);
        image.setExperience(this);
    }

    public void addReview(Review review) {
        this.reviews.add(review);
        review.setExperience(this);
    }
}