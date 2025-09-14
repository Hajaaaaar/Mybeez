package com.Mybeez.TeamB.TeamB.payload;

import java.time.LocalDate;
import java.util.List;

public record DailyAvailabilityDTO(
        LocalDate date,
        List<SlotDTO> slots
) {}