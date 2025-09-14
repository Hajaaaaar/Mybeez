package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.PersonalScheduleEntry;
import lombok.*;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalScheduleResponse {
    private Long id;
    private String title;
    private String description;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public PersonalScheduleResponse(PersonalScheduleEntry entry) {
        this.id = entry.getId();
        this.title = entry.getTitle();
        this.description = entry.getDescription();
        this.startTime = entry.getStartTime();
        this.endTime = entry.getEndTime();
        this.createdAt = entry.getCreatedAt();
        this.updatedAt = entry.getUpdatedAt();
    }
}