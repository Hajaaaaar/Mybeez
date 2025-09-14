package com.Mybeez.TeamB.TeamB.payload;

import java.time.LocalTime;

public record SlotDTO(
        Long availabilityId,
        LocalTime startTime,
        LocalTime endTime,
        Integer spotsLeft
) {}