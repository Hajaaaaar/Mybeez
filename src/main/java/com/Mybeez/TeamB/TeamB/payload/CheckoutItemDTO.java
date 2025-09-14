package com.Mybeez.TeamB.TeamB.payload;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CheckoutItemDTO {
    private String name;
    private BigDecimal price; // Price in pounds/dollars
    private int quantity;

    private Integer availabilityId;
    private Integer guestCount;
    private String couponCode;
}