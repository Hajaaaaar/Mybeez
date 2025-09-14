package com.Mybeez.TeamB.TeamB.payload;

import java.math.BigDecimal;
import java.util.List;

public record GroupAvailabilityResponse(
        BigDecimal groupPricePerPerson,
        List<DailyAvailabilityDTO> availableDates
) {}