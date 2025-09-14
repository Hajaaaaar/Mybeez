package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.WishlistItem;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class WishlistItemDTO {

    private Long wishlistItemId; // The ID of the wishlist item itself, for easy removal
    private Long experienceId;
    private String title;
    private LocationResponse location;
    private List<ImageResponse> images;

    public WishlistItemDTO(WishlistItem item) {
        this.wishlistItemId = item.getId();
        this.experienceId = item.getExperience().getId();
        this.title = item.getExperience().getTitle();
        this.location = new LocationResponse(item.getExperience().getLocation());
        this.images = item.getExperience()
                .getImages()
                .stream()
                .map(ImageResponse::new)
                .collect(Collectors.toList());
    }
}
