package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.CheckoutItemDTO;
import com.Mybeez.TeamB.TeamB.payload.CouponDTO;
import com.Mybeez.TeamB.TeamB.service.CouponService;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    @Autowired
    private CouponService couponService;

    @PostMapping
    public ResponseEntity<?> createCheckoutSession(
            @RequestBody CheckoutItemDTO checkoutItemDTO,
            @AuthenticationPrincipal User currentUser
    ) {
        String successUrl = "http://localhost:3000/profile";
        String cancelUrl = "http://localhost:3000/cart";

        BigDecimal finalPrice = checkoutItemDTO.getPrice();

        // CALCULATE FINAL PRICE IF COUPON IS PRESENT
        if (checkoutItemDTO.getCouponCode() != null && !checkoutItemDTO.getCouponCode().isEmpty()) {
            try {
                CouponDTO coupon = couponService.validateCoupon(checkoutItemDTO.getCouponCode());
                BigDecimal discountMultiplier = BigDecimal.ONE.subtract(coupon.getDiscountPercentage().divide(new BigDecimal("100")));
                finalPrice = finalPrice.multiply(discountMultiplier).setScale(2, RoundingMode.HALF_UP);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
            }
        }

        try {
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(cancelUrl)
                    .putMetadata("userId", currentUser.getId().toString())
                    .putMetadata("availabilityId", checkoutItemDTO.getAvailabilityId().toString())
                    .putMetadata("guestCount", checkoutItemDTO.getGuestCount().toString())
                    .addAllLineItem(
                            Collections.singletonList(
                                    SessionCreateParams.LineItem.builder()
                                            .setQuantity(1L)
                                            .setPriceData(
                                                    SessionCreateParams.LineItem.PriceData.builder()
                                                            .setCurrency("gbp")
                                                            // Use the calculated final price
                                                            .setUnitAmount(finalPrice.multiply(new BigDecimal("100")).longValue())
                                                            .setProductData(
                                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                            .setName(checkoutItemDTO.getName())
                                                                            .build()
                                                            ).build()
                                            ).build()
                            )
                    ).build();

            Session session = Session.create(params);
            Map<String, String> response = new HashMap<>();
            response.put("url", session.getUrl());
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating Stripe checkout session.");
        }
    }
}