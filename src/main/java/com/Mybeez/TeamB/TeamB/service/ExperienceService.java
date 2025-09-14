package com.Mybeez.TeamB.TeamB.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.Map;
import java.util.function.Function;

import com.Mybeez.TeamB.TeamB.payload.ExperienceEditResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Mybeez.TeamB.TeamB.repository.ReviewRepository;
import com.Mybeez.TeamB.TeamB.exception.ResourceNotFoundException;
import com.Mybeez.TeamB.TeamB.model.Availability;
import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.ExperienceCategory;
import com.Mybeez.TeamB.TeamB.model.ExperienceStatus;
import com.Mybeez.TeamB.TeamB.model.Image;
import com.Mybeez.TeamB.TeamB.model.Location;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.ExperienceDTO;
import com.Mybeez.TeamB.TeamB.payload.ExperienceRequest;
import com.Mybeez.TeamB.TeamB.payload.LocationRequest;
import com.Mybeez.TeamB.TeamB.repository.ExperienceCategoryRepository;
import com.Mybeez.TeamB.TeamB.repository.ExperienceRepository;
import com.Mybeez.TeamB.TeamB.repository.ExperienceSpecifications;
import com.Mybeez.TeamB.TeamB.repository.LocationRepository;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;

@Service
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final UserRepository userRepository;
    private final ExperienceCategoryRepository experienceCategoryRepository;
    private final LocationRepository locationRepository;
    private final ReviewRepository reviewRepository;

    public ExperienceService(
            ExperienceRepository experienceRepository,
            UserRepository userRepository,
            ExperienceCategoryRepository experienceCategoryRepository,
            LocationRepository locationRepository,
            ReviewRepository reviewRepository) {
        this.experienceRepository = experienceRepository;
        this.userRepository = userRepository;
        this.experienceCategoryRepository = experienceCategoryRepository;
        this.locationRepository = locationRepository;
        this.reviewRepository = reviewRepository;
    }

    // --- Write (Command) Method ---

    @Transactional
    public Experience createExperience(ExperienceRequest req, Long hostId) {
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> new ResourceNotFoundException("Host not found with id: " + hostId));

        ExperienceCategory category = experienceCategoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + req.getCategoryId()));

        LocationRequest locReq = req.getLocationRequest();
        Location location = locationRepository.findByAddressAndCityAndPostcode(
                locReq.getAddress(),
                locReq.getCity(),
                locReq.getPostcode()).orElseGet(() -> {
                    Location newLoc = new Location();
                    newLoc.setAddress(locReq.getAddress());
                    newLoc.setCity(locReq.getCity());
                    newLoc.setPostcode(locReq.getPostcode());
                    return locationRepository.save(newLoc);
                });

        Experience experience = Experience.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .sessionTypes(req.getSessionTypes())
                .groupPricePerPerson(req.getGroupPricePerPerson())
                .privatePrice(req.getPrivatePrice())
                .host(host)
                .category(category)
                .status(ExperienceStatus.PENDING)
                .location(location)
                .durationInMinutes(req.getDurationInMinutes())
                .tags(req.getTags())
                .build();

        req.getAvailableSlots().forEach(slotDto -> {
            Availability availability = Availability.builder()
                    .date(LocalDate.parse(slotDto.getDate()))
                    .startTime(LocalTime.parse(slotDto.getStartTime(), DateTimeFormatter.ofPattern("HH:mm")))
                    .endTime(LocalTime.parse(slotDto.getEndTime(), DateTimeFormatter.ofPattern("HH:mm")))
                    .capacity(slotDto.getCapacity())
                    .build();
            experience.addAvailability(availability);
        });

        req.getImages().forEach(imageDto -> {
            Image image = Image.builder()
                    .url(imageDto.getUrl())
                    .publicId(imageDto.getPublicId())
                    .build();
            experience.addImage(image);
        });

        return experienceRepository.save(experience);
    }

    @Transactional
    public ExperienceEditResponse updateExperienceForHost(Long experienceId, ExperienceRequest request, Long hostId) {
        System.out.println("=== SERVICE UPDATE DEBUG ===");
        System.out.println("Updating experience ID: " + experienceId);
        System.out.println("Request title: " + request.getTitle());
        System.out.println("Request session types: " + request.getSessionTypes());
        System.out.println("Request group price: " + request.getGroupPricePerPerson());
        System.out.println("Request available slots: " + request.getAvailableSlots());
        System.out.println("Request images: " + request.getImages());

        // Get the experience and check ownership
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found"));

        if (!experience.getHost().getId().equals(hostId)) {
            throw new AccessDeniedException("You are not the owner of this experience.");
        }

        // ADD THIS VALIDATION: Check if experience is completed
        if (experience.getStatus() == ExperienceStatus.COMPLETED) {
            throw new IllegalStateException("Cannot update a completed experience");
        }

        // Update ALL the experience fields
        experience.setTitle(request.getTitle());
        experience.setDescription(request.getDescription());
        experience.setDurationInMinutes(request.getDurationInMinutes());

        // Update session types
        experience.setSessionTypes(request.getSessionTypes());

        // Update pricing
        experience.setGroupPricePerPerson(request.getGroupPricePerPerson());
        experience.setPrivatePrice(request.getPrivatePrice());

        // Update tags
        experience.setTags(request.getTags());

        // Update category
        if (request.getCategoryId() != null) {
            ExperienceCategory category = experienceCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            experience.setCategory(category);
        }

        // Update location
        if (request.getLocationRequest() != null) {
            Location location = experience.getLocation();
            if (location == null) {
                location = new Location();
            }
            location.setAddress(request.getLocationRequest().getAddress());
            location.setCity(request.getLocationRequest().getCity());
            location.setPostcode(request.getLocationRequest().getPostcode());

            // Save location (both new and existing)
            location = locationRepository.save(location);
            experience.setLocation(location);
        }

        // Update availability slots
        if (request.getAvailableSlots() != null) {
            // Clear existing availability
            experience.getAvailability().clear();

            // Add new availability slots
            for (var slotRequest : request.getAvailableSlots()) {
                Availability availability = new Availability();

                // Parse strings to proper types (like in your create method)
                availability.setDate(LocalDate.parse(slotRequest.getDate()));
                availability.setStartTime(LocalTime.parse(slotRequest.getStartTime(), DateTimeFormatter.ofPattern("HH:mm")));
                availability.setEndTime(LocalTime.parse(slotRequest.getEndTime(), DateTimeFormatter.ofPattern("HH:mm")));
                availability.setCapacity(slotRequest.getCapacity());
                availability.setExperience(experience);

                experience.getAvailability().add(availability);
            }
        }

        // Update images
        if (request.getImages() != null) {
            // Clear existing images
            experience.getImages().clear();

            // Add new images
            request.getImages().forEach(imageDto -> {
                Image image = Image.builder()
                        .url(imageDto.getUrl())
                        .publicId(imageDto.getPublicId())
                        .build();
                experience.addImage(image);
            });
        }

        System.out.println("Saving updated experience...");

        // Save and return
        Experience savedExperience = experienceRepository.save(experience);

        System.out.println("Experience saved successfully!");

        // Force load collections
        savedExperience.getAvailability().size();
        savedExperience.getImages().size();

        return new ExperienceEditResponse(savedExperience);
    }

    public ExperienceEditResponse getExperienceByIdForHost(Long experienceId, Long hostId) {
        // Step 1: Get the basic experience
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found"));

        // Step 2: Security check
        if (!experience.getHost().getId().equals(hostId)) {
            throw new AccessDeniedException("You are not the owner of this experience.");
        }

        // Step 3: Now safely open both entities, one at a time
        experience.getAvailability().size();
        experience.getImages().size();

        // Step 4: Now it's safe to create the response
        return new ExperienceEditResponse(experience);
    }

    // --- Read (Query) Methods ---

    public List<ExperienceDTO> getAllExperiences() {
        return experienceRepository.findAll().stream()
                .map(ExperienceDTO::new)
                .collect(Collectors.toList());
    }

    public ExperienceDTO getExperienceById(Long id) {
        // Remember to use JOIN FETCH in the repository for performance
        Experience experience = experienceRepository.findByIdWithHost(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found with id " + id));

        return new ExperienceDTO(experience);
    }

    public List<ExperienceDTO> getExperiencesByHost(Long hostId) {
        return experienceRepository.findByHostId(hostId);
    }

    public List<ExperienceCategory> getAllCategories() {
        return experienceCategoryRepository.findAll();
    }

    public List<ExperienceDTO> filterExperiences(
            String keyword,
            Long categoryId,
            String location,
            String sessionType,
            Integer minDuration,
            Integer maxDuration,
            Integer minGroupPrice,
            Integer maxGroupPrice) {
        // This is the modern replacement for the deprecated `where(null)`
        Specification<Experience> spec =
                (root, query, cb) -> cb.equal(root.get("status"), ExperienceStatus.APPROVED);

        // Conditionally add filters to the specification chain
        if (keyword != null && !keyword.isEmpty()) {
            spec = spec.and(ExperienceSpecifications.hasKeyword(keyword));
        }
        if (categoryId != null) {
            spec = spec.and(ExperienceSpecifications.hasCategory(categoryId));
        }
        if (location != null && !location.isEmpty()) {
            spec = spec.and(ExperienceSpecifications.hasLocation(location));
        }
        if (sessionType != null && !sessionType.isEmpty()) {
            spec = spec.and(ExperienceSpecifications.hasSessionType(sessionType));
        }
        if (minDuration != null) {
            spec = spec.and(ExperienceSpecifications.hasMinDuration(minDuration));
        }
        if (maxDuration != null) {
            spec = spec.and(ExperienceSpecifications.hasMaxDuration(maxDuration));
        }
        if (minGroupPrice != null) {
            spec = spec.and(ExperienceSpecifications.hasMinGroupPrice(minGroupPrice));
        }
        if (maxGroupPrice != null) {
            spec = spec.and(ExperienceSpecifications.hasMaxGroupPrice(maxGroupPrice));
        }

        List<Experience> filteredExperiences = experienceRepository.findAll(spec);

        return filteredExperiences.stream()
                .map(ExperienceDTO::new)
                .collect(Collectors.toList());
    }

    public List<ExperienceDTO> getExperiencesByHostAndStatus(Long hostId, ExperienceStatus status) {
        return experienceRepository.findByHostIdAndStatus(hostId, status);
    }
    @Transactional(readOnly = true)
    public List<ExperienceDTO> getFeaturedExperiences() {
        PageRequest pageRequest = PageRequest.of(0, 3);
        List<Long> topExperienceIds = reviewRepository.findTopRatedExperienceIds(pageRequest);

        List<Experience> featuredExperiences;

        if (!topExperienceIds.isEmpty()) {
            // If we found experiences with reviews, fetch them
            List<Experience> unorderedExperiences = experienceRepository.findAllById(topExperienceIds);

            // Create a map for quick lookups to preserve the order from the review query
            Map<Long, Experience> experienceMap = unorderedExperiences.stream()
                    .collect(Collectors.toMap(Experience::getId, Function.identity()));

            // Re-order the experiences based on the sorted IDs from the review query
            featuredExperiences = topExperienceIds.stream()
                    .map(experienceMap::get)
                    .collect(Collectors.toList());

        } else {
            // FALLBACK: If there are no reviews in the system yet, fall back
            // to the original logic of using the persisted `rating` field
            // To ensure the homepage is not empty on launch
            featuredExperiences = experienceRepository.findByOrderByRatingDesc(pageRequest);
        }

        return featuredExperiences.stream()
                .map(ExperienceDTO::new)
                .collect(Collectors.toList());
    }
}