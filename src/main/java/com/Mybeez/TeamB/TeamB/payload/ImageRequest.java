package com.Mybeez.TeamB.TeamB.payload;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ImageRequest {
    @NotBlank(message = "Image URL is required")
    private String url;

    @NotBlank(message = "Image publicId is required")
    private String publicId;
}
