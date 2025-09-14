package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.Image;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ImageResponse {
    private Long   id;
    private String url;
    private String publicId;

    public ImageResponse(Image img) {
        this.id= img.getId();
        this.url = img.getUrl();
        this.publicId = img.getPublicId();
    }
}