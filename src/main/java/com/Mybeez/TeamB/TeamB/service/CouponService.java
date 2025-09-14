package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.exception.InvalidCouponException;
import com.Mybeez.TeamB.TeamB.model.Coupon;
import com.Mybeez.TeamB.TeamB.payload.CouponDTO;
import com.Mybeez.TeamB.TeamB.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public CouponDTO validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new InvalidCouponException("Coupon code not found."));

        if (!coupon.isActive()) {
            throw new InvalidCouponException("This coupon is no longer active.");
        }

        if (coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new InvalidCouponException("This coupon has expired.");
        }

        return new CouponDTO(coupon);
    }
}