package com.Mybeez.TeamB.TeamB.Unit;

import com.Mybeez.TeamB.TeamB.exception.ResourceNotFoundException;
import com.Mybeez.TeamB.TeamB.model.*;
import com.Mybeez.TeamB.TeamB.payload.ExperienceDTO;
import com.Mybeez.TeamB.TeamB.payload.ExperienceEditResponse;
import com.Mybeez.TeamB.TeamB.payload.ExperienceRequest;
import com.Mybeez.TeamB.TeamB.payload.LocationRequest;
import com.Mybeez.TeamB.TeamB.repository.ExperienceCategoryRepository;
import com.Mybeez.TeamB.TeamB.repository.ExperienceRepository;
import com.Mybeez.TeamB.TeamB.repository.LocationRepository;
import com.Mybeez.TeamB.TeamB.repository.ReviewRepository;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import com.Mybeez.TeamB.TeamB.service.ExperienceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.ArrayList;
import java.util.Collections;
import org.springframework.data.domain.PageRequest;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExperienceServiceTest {


    @Mock
    private ExperienceRepository experienceRepository;

    // FIX: Add mocks for all dependencies required by the ExperienceService constructor
    @Mock
    private UserRepository userRepository;
    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ExperienceCategoryRepository experienceCategoryRepository;
    @Mock
    private LocationRepository locationRepository;

    @InjectMocks
    private ExperienceService experienceService;

    private User host;
    private Experience experience;
    private ExperienceCategory category;
    private Location location;
    private ExperienceRequest experienceRequest;

    @Test
    void whenExperienceExists_getExperienceById_returnsExperienceDTO() {
        // 1. Arrange
        Long experienceId = 1L;
        User host = new User();
        host.setFirstName("Test Host");

        // Add mock objects for related entities to prevent NullPointerExceptions in the DTO constructor
        ExperienceCategory category = new ExperienceCategory();
        category.setName("Testing");
        Location location = new Location();
        location.setCity("Testville");

        Experience mockExperience = new Experience();
        mockExperience.setId(experienceId);
        mockExperience.setTitle("Test Title");
        mockExperience.setHost(host);
        mockExperience.setCategory(category);
        mockExperience.setLocation(location);

        // FIX: Mock the correct repository method: findByIdWithHost()
        when(experienceRepository.findByIdWithHost(experienceId)).thenReturn(Optional.of(mockExperience));

        // 2. Act
        ExperienceDTO result = experienceService.getExperienceById(experienceId);

        // 3. Assert
        assertNotNull(result);
        assertEquals("Test Title", result.getTitle());
        assertEquals("Test Host", result.getHost().getFirstName());

        // FIX: Verify the correct repository method was called
        verify(experienceRepository, times(1)).findByIdWithHost(experienceId);
    }

    @Test
    void whenExperienceDoesNotExist_getExperienceById_throwsResourceNotFoundException() {
        // 1. Arrange
        Long experienceId = 99L;
        // FIX: Mock the correct repository method: findByIdWithHost()
        when(experienceRepository.findByIdWithHost(experienceId)).thenReturn(Optional.empty());

        // 2. Act & 3. Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            experienceService.getExperienceById(experienceId);
        });

        // FIX: Verify the correct repository method was called
        verify(experienceRepository, times(1)).findByIdWithHost(experienceId);
    }

    @BeforeEach
    void setUp() {
        host = new User();
        host.setId(1L);

        category = new ExperienceCategory();
        category.setId(1L);

        LocationRequest locationRequest = new LocationRequest();
        locationRequest.setAddress("123 Test St");

        location = new Location();
        location.setAddress("123 Test St");

        experienceRequest = new ExperienceRequest();
        experienceRequest.setTitle("Test Experience");
        experienceRequest.setDescription("A great description.");
        experienceRequest.setCategoryId(category.getId());
        experienceRequest.setLocationRequest(locationRequest);
        experienceRequest.setAvailableSlots(Collections.emptyList());
        experienceRequest.setImages(Collections.emptyList());
    }

    // --- Test Cases for createExperience ---

    @Test
    void whenCreateExperience_withValidData_shouldSaveAndReturnExperience() {
        // Arrange
        when(userRepository.findById(host.getId())).thenReturn(Optional.of(host));
        when(experienceCategoryRepository.findById(category.getId())).thenReturn(Optional.of(category));
        when(locationRepository.findByAddressAndCityAndPostcode(any(), any(), any())).thenReturn(Optional.of(location));
        when(experienceRepository.save(any(Experience.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Experience result = experienceService.createExperience(experienceRequest, host.getId());

        // Assert
        assertNotNull(result);
        assertEquals("Test Experience", result.getTitle()); // This will now pass.
        assertEquals(host, result.getHost());
        verify(experienceRepository, times(1)).save(any(Experience.class));
    }

    // --- Test Cases for updateExperienceForHost ---

    @Test
    void whenUpdateExperience_asOwner_shouldUpdateAndReturnDTO() {
        // Arrange
        Experience existingExperience = new Experience();
        existingExperience.setId(1L);
        existingExperience.setHost(host);
        existingExperience.setStatus(ExperienceStatus.PENDING);
        // Initialize collections to prevent NullPointerException.
        existingExperience.setAvailability(new ArrayList<>());
        existingExperience.setImages(new ArrayList<>());

        experienceRequest.setTitle("Updated Title");

        when(experienceRepository.findById(1L)).thenReturn(Optional.of(existingExperience));
        when(experienceCategoryRepository.findById(any())).thenReturn(Optional.of(category));
        when(locationRepository.save(any())).thenReturn(location);
        // Mock the save method to return the updated experience
        when(experienceRepository.save(any(Experience.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        ExperienceEditResponse result = experienceService.updateExperienceForHost(1L, experienceRequest, host.getId());

        // Assert
        assertNotNull(result);
        assertEquals("Updated Title", result.getTitle());
    }

    @Test
    void whenUpdateExperience_asNonOwner_shouldThrowAccessDeniedException() {
        // Arrange
        Long attackerId = 2L;
        Experience experience = new Experience();
        experience.setHost(host);

        when(experienceRepository.findById(1L)).thenReturn(Optional.of(experience));

        // Act & Assert
        assertThrows(AccessDeniedException.class, () -> {
            experienceService.updateExperienceForHost(1L, experienceRequest, attackerId);
        });
    }

    @Test
    void whenUpdateExperience_thatIsCompleted_shouldThrowIllegalStateException() {
        // Arrange
        Experience completedExperience = new Experience();
        completedExperience.setId(1L);
        completedExperience.setHost(host);
        completedExperience.setStatus(ExperienceStatus.COMPLETED);
        // Initialize collections to prevent NullPointerException.
        completedExperience.setAvailability(new ArrayList<>());
        completedExperience.setImages(new ArrayList<>());

        when(experienceRepository.findById(1L)).thenReturn(Optional.of(completedExperience));

        // Debug: Let's verify the experience status before calling the method
        System.out.println("=== TEST DEBUG ===");
        System.out.println("Experience status: " + completedExperience.getStatus());
        System.out.println("Expected status: " + ExperienceStatus.COMPLETED);
        System.out.println("Status equals COMPLETED: " + (completedExperience.getStatus() == ExperienceStatus.COMPLETED));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> {
            experienceService.updateExperienceForHost(1L, experienceRequest, host.getId());
        });
    }

    @Test
    void getFeaturedExperiences_ShouldUseReviewRatings_WhenReviewsExist() {
        // Arrange
        List<Long> topRatedIds = List.of(3L, 1L, 2L);
        when(reviewRepository.findTopRatedExperienceIds(any(PageRequest.class))).thenReturn(topRatedIds);

        Experience exp1 = Experience.builder().id(1L).title("Experience 1").build();
        Experience exp2 = Experience.builder().id(2L).title("Experience 2").build();
        Experience exp3 = Experience.builder().id(3L).title("Experience 3").build();
        when(experienceRepository.findAllById(topRatedIds)).thenReturn(List.of(exp1, exp2, exp3));

        // Act
        List<ExperienceDTO> result = experienceService.getFeaturedExperiences();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getId()).isEqualTo(3L);
        assertThat(result.get(1).getId()).isEqualTo(1L);
        assertThat(result.get(2).getId()).isEqualTo(2L);

        verify(reviewRepository, times(1)).findTopRatedExperienceIds(any(PageRequest.class));
        verify(experienceRepository, never()).findByOrderByRatingDesc(any(PageRequest.class));
    }

    @Test
    void getFeaturedExperiences_ShouldUseFallback_WhenNoReviewsExist() {
        // Arrange
        when(reviewRepository.findTopRatedExperienceIds(any(PageRequest.class))).thenReturn(Collections.emptyList());

        Experience expFallback = Experience.builder().id(10L).title("Fallback Experience").rating(5.0).build();
        when(experienceRepository.findByOrderByRatingDesc(any(PageRequest.class))).thenReturn(List.of(expFallback));

        // Act
        List<ExperienceDTO> result = experienceService.getFeaturedExperiences();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(10L);

        verify(reviewRepository, times(1)).findTopRatedExperienceIds(any(PageRequest.class));
        verify(experienceRepository, times(1)).findByOrderByRatingDesc(any(PageRequest.class));
    }
}