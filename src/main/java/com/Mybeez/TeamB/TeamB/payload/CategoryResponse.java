package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.ExperienceCategory;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;

    public CategoryResponse(ExperienceCategory category) {
        if (category != null) {
            this.id = category.getId();
            this.name = category.getName();
            this.description = category.getDescription();
        }
    }
}