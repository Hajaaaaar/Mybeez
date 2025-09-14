package com.Mybeez.TeamB.TeamB.payload;

import lombok.*;
import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarEventResponse {
    private Long id;

    private String title;

    private ZonedDateTime startTime;

    private ZonedDateTime endTime;

    private String type; // "experience" or "personal"

    private String description;

    // Optional field for experience events
    private Long experienceId;
}