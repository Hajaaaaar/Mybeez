package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.model.WishlistItem;
import com.Mybeez.TeamB.TeamB.model.Experience;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.WishlistItemDTO; // ✅ 1. IMPORT THE NEW DTO
import com.Mybeez.TeamB.TeamB.repository.ExperienceRepository;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import com.Mybeez.TeamB.TeamB.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors; // ✅ 2. IMPORT COLLECTORS

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WishlistItemDTO> getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId)
                .stream()
                .map(WishlistItemDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addToWishlist(Long userId, Long experienceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Experience exp = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new RuntimeException("Experience not found"));

        if (wishlistRepository.existsByUserIdAndExperienceId(userId, experienceId)) {
            return; // Already in wishlist, do nothing.
        }

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .experience(exp)
                .build();

        wishlistRepository.save(item);
    }

    @Transactional
    public void removeFromWishlistById(Long wishlistItemId) {
        wishlistRepository.deleteById(wishlistItemId);
    }
}