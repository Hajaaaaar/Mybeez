package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.model.UserRole;
import com.Mybeez.TeamB.TeamB.payload.UserStatsDTO;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import com.Mybeez.TeamB.TeamB.repository.UserSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Page<User> getUsers(String search, UserRole role, Boolean active, Pageable pageable) {
        UserSpecification spec = new UserSpecification(search, role, active);
        return userRepository.findAll(spec, pageable);
    }

    public void activateUser(Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setActive(true);
            user.setBanned(false);
            user.setDeleted(false);
            userRepository.save(user);
        });
    }

    public void deactivateUser(Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setActive(false);
            userRepository.save(user);
        });
    }

    public void banUser(Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setBanned(true);
            user.setActive(false);
            userRepository.save(user);
        });
    }

    public void unbanUser(Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setBanned(false);
            user.setActive(true);
            userRepository.save(user);
        });
    }

    public void softDeleteUser(Long id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setDeleted(true);
            user.setActive(false);
            userRepository.save(user);
        });
    }

    public long countActiveUsers() {
        return userRepository.countByActive(true);
    }

    public UserStatsDTO getUserStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActive(true);
        long bannedUsers = userRepository.countByBanned(true);
        long deletedUsers = userRepository.countByDeleted(true);
        long inactiveUsers = totalUsers - activeUsers;

        return new UserStatsDTO(totalUsers, activeUsers, inactiveUsers, bannedUsers, deletedUsers);
    }
}
