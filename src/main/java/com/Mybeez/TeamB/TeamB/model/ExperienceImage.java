package com.Mybeez.TeamB.TeamB.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Entity
@Table(name = "experience_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_id")
    @JsonBackReference("experience-images")
    private Experience experience;

    @Column(name = "image_url")
    private String imageUrl;


}