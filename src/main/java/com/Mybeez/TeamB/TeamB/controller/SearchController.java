package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.Mybeez.TeamB.TeamB.payload.ExperienceDTO;

import java.util.List;

@RestController
@RequestMapping("/api/search")
//@CrossOrigin(origins = "http://localhost:3000")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<List<ExperienceDTO>> search(@RequestParam String keyword) { 
        List<ExperienceDTO> results = searchService.searchExperiences(keyword);
        return ResponseEntity.ok(results);
    }
}
