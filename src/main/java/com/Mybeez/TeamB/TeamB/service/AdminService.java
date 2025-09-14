package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.exception.ResourceNotFoundException;
import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.ExperienceStatus;
import com.Mybeez.TeamB.TeamB.model.Rejection;
import com.Mybeez.TeamB.TeamB.repository.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ExperienceRepository experienceRepository;

    /**
     * Retrieves all experiences with a 'PENDING' status.
     * @return A list of pending Experience objects.
     */
    @Transactional(readOnly = true)
    public List<Experience> getPendingExperiences() {
        return experienceRepository.findByStatus(ExperienceStatus.PENDING);
    }

    /**
     * Approves a pending experience by changing its status to 'APPROVED'.
     * @param experienceId The ID of the experience to approve.
     * @return The updated Experience object.
     */
    @Transactional
    public Experience approveExperience(Long experienceId) {
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found with id: " + experienceId));

        experience.setStatus(ExperienceStatus.APPROVED);
        // In a real app, you would also send an email notification to the host here.
        return experienceRepository.save(experience);
    }

    /**
     * Rejects a pending experience, creating a related Rejection entity.
     * @param experienceId The ID of the experience to reject.
     * @param reason The reason for the rejection.
     * @return The updated Experience object with its new status and associated rejection.
     */
    @Transactional
    public Experience rejectExperience(Long experienceId, String reason) {
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found with id: " + experienceId));

        // Set the status to rejected
        experience.setStatus(ExperienceStatus.REJECTED);

        // Create a new Rejection entity and link it to the experience
        Rejection rejection = new Rejection(reason, experience);
        experience.setRejection(rejection);

        // In a real app, you would also send an email notification to the host here.
        // Because of the CascadeType.ALL setting on the Experience entity,
        // saving the experience will automatically save the new Rejection record as well.
        return experienceRepository.save(experience);
    }
    /**
     * Retrieves all experiences with an 'APPROVED' status.
     * @return A list of approved Experience objects.
     */
    @Transactional(readOnly = true)
    public List<Experience> getApprovedExperiences() {
        return experienceRepository.findByStatus(ExperienceStatus.APPROVED);
    }
}