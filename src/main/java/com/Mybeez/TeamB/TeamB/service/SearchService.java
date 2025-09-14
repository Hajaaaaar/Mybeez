package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.repository.ExperienceRepository;
import org.springframework.stereotype.Service;
import com.Mybeez.TeamB.TeamB.payload.ExperienceDTO;
import java.util.stream.Collectors;

import java.util.List;

@Service
public class SearchService {

    private final ExperienceRepository experienceRepository;

    public SearchService(ExperienceRepository experienceRepository) {
        this.experienceRepository = experienceRepository;
    }

    public List<ExperienceDTO> searchExperiences(String keyword) { // ✅ Change return type
        return experienceRepository.searchByKeyword(keyword.toLowerCase())
                .stream()
                .map(ExperienceDTO::new) // Convert to DTO
                .collect(Collectors.toList());
    }
}
