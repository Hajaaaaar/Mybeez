package com.Mybeez.TeamB.TeamB.Unit;

import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.ExperienceStatus;
import com.Mybeez.TeamB.TeamB.model.Location;
import com.Mybeez.TeamB.TeamB.payload.ExperienceDTO;
import com.Mybeez.TeamB.TeamB.repository.ExperienceCategoryRepository;
import com.Mybeez.TeamB.TeamB.repository.ExperienceRepository;
import com.Mybeez.TeamB.TeamB.repository.LocationRepository;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import com.Mybeez.TeamB.TeamB.service.ExperienceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ExperienceService.filterExperiences(...).
 * Pure Mockito (no Spring context).
 */
@ExtendWith(MockitoExtension.class)
class ExperienceServiceUnitTest {

    @Mock private ExperienceRepository experienceRepository;
    @Mock private UserRepository userRepository; // required by ctor, not used here
    @Mock private ExperienceCategoryRepository experienceCategoryRepository; // required by ctor, not used here
    @Mock private LocationRepository locationRepository; // required by ctor, not used here

    @InjectMocks
    private ExperienceService experienceService;

    // Minimal Experience builder that matches your model
    private static Experience exp(Long id, String title, String city) {
        Experience e = new Experience();
        e.setId(id);
        e.setTitle(title);
        e.setDescription("desc");
        e.setStatus(ExperienceStatus.APPROVED);
        e.setGroupPricePerPerson(new BigDecimal("25.00"));
        e.setPrivatePrice(new BigDecimal("120.00"));
        e.setDurationInMinutes(90);
        e.setCreatedAt(LocalDateTime.now());
        e.setUpdatedAt(LocalDateTime.now());

        // set nested Location with city
        Location loc = new Location();
        loc.setCity(city);
        e.setLocation(loc);

        return e;
    }

    @Test
    void filterExperiences_callsRepositoryWithSpecification_andMapsToDTOs() {
        // Arrange
        String keyword = "yoga";
        Long categoryId = 3L;
        String location = "Cardiff";
        String sessionType = "GROUP";
        Integer minDuration = 60;
        Integer maxDuration = 120;
        Integer minGroupPrice = 10;
        Integer maxGroupPrice = 50;

        var e1 = exp(101L, "Sunset Yoga", "Cardiff");
        var e2 = exp(102L, "Morning Yoga", "Cardiff");

        when(experienceRepository.findAll(any(Specification.class)))
                .thenReturn(List.of(e1, e2));

        // Act
        List<ExperienceDTO> results = experienceService.filterExperiences(
                keyword, categoryId, location, sessionType,
                minDuration, maxDuration, minGroupPrice, maxGroupPrice
        );

        // Assert
        assertThat(results).hasSize(2);
        verify(experienceRepository, times(1)).findAll(any(Specification.class));
        verifyNoMoreInteractions(experienceRepository);
    }

    @Test
    void filterExperiences_returnsEmptyList_whenRepositoryFindsNothing() {
        when(experienceRepository.findAll(any(Specification.class)))
                .thenReturn(List.of());

        List<ExperienceDTO> results = experienceService.filterExperiences(
                null, null, null, null,
                null, null, null, null
        );

        assertThat(results).isEmpty();
        verify(experienceRepository).findAll(any(Specification.class));
        verifyNoMoreInteractions(experienceRepository);
    }
}
