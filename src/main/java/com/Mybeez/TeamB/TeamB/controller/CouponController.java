package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.payload.CouponDTO;
import com.Mybeez.TeamB.TeamB.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @GetMapping("/validate/{code}")
    public ResponseEntity<CouponDTO> validateCoupon(@PathVariable String code) {
        CouponDTO validCoupon = couponService.validateCoupon(code);
        return ResponseEntity.ok(validCoupon);
    }
}