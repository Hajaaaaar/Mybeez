package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.Availability;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AvailabilityResponse {
    private Long id;
    private String date;
    private String startTime;
    private String endTime;
    private Integer capacity;

    public AvailabilityResponse(Availability availability) {
        if (availability != null) {
            this.id = availability.getId();
            this.date = availability.getDate().toString();
            this.startTime = availability.getStartTime().toString();
            this.endTime = availability.getEndTime().toString();
            this.capacity = availability.getCapacity();
        }
    }
}