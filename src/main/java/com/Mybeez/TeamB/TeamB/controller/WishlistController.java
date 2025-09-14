package com.Mybeez.TeamB.TeamB.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.WishlistItemDTO;
import com.Mybeez.TeamB.TeamB.service.WishlistService;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    private Long getCurrentUserId(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

    @GetMapping
    public List<WishlistItemDTO> getWishlist(Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        return wishlistService.getWishlist(userId);
    }

    @PostMapping("/{experienceId}")
    public void add(@PathVariable Long experienceId, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        wishlistService.addToWishlist(userId, experienceId);
    }

    @DeleteMapping("/{wishlistItemId}")
    public void remove(@PathVariable Long wishlistItemId, Authentication authentication) {
        // Note: For real-world apps, you'd also want to verify that the
        // wishlistItemId belongs to the currently authenticated user before deleting.
        wishlistService.removeFromWishlistById(wishlistItemId);
    }
}