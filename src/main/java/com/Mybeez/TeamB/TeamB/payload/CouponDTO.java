package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.Coupon;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
public class CouponDTO {
    private String code;
    private BigDecimal discountPercentage;

    public CouponDTO(Coupon coupon) {
        this.code = coupon.getCode();
        this.discountPercentage = coupon.getDiscountPercentage();
    }
}