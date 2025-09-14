package com.Mybeez.TeamB.TeamB.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rejections")
@Data
@NoArgsConstructor
public class Rejection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob // Use @Lob for potentially long text strings
    @Column(nullable = false)
    private String reason;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime rejectionDate;

    @OneToOne
    @JoinColumn(name = "experience_id", nullable = false)
    @JsonBackReference // Prevents infinite loops during JSON serialization
    private Experience experience;

    public Rejection(String reason, Experience experience) {
        this.reason = reason;
        this.experience = experience;
    }
}