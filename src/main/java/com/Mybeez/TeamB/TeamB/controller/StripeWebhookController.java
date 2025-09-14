package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.payload.BookingRequest;
import com.Mybeez.TeamB.TeamB.service.BookingService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe-webhook")
public class StripeWebhookController {

    @Autowired
    private BookingService bookingService;

    private final String webhookSecret;

    // Load the secret from your .env file
    public StripeWebhookController() {
        Dotenv dotenv = Dotenv.load();
        this.webhookSecret = dotenv.get("STRIPE_WEBHOOK_SECRET");
    }

    @PostMapping
    public ResponseEntity<String> handleStripeEvent(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {

        if (sigHeader == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing Stripe-Signature header");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, this.webhookSecret);
        } catch (SignatureVerificationException e) {
            System.out.println("⚠️  Webhook error while validating signature.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Signature verification failed.");
        }

        // Handle the checkout.session.completed event
        if ("checkout.session.completed".equals(event.getType())) {
            Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
            if (session != null) {
                System.out.println("✅ Payment Succeeded! Fulfilling order...");
                fulfillOrder(session);
            }
        }

        return ResponseEntity.ok("Received");
    }

    private void fulfillOrder(Session session) {
        // Retrieve metadata we stored earlier
        String userIdStr = session.getMetadata().get("userId");
        String availabilityIdStr = session.getMetadata().get("availabilityId");
        String guestCountStr = session.getMetadata().get("guestCount");

        Long userId = Long.parseLong(userIdStr);
        Integer availabilityId = Integer.parseInt(availabilityIdStr);
        Integer guestCount = Integer.parseInt(guestCountStr);

        // Create a BookingRequest and call the existing service
        BookingRequest bookingRequest = new BookingRequest();
        bookingRequest.setAvailabilityId(availabilityId);
        bookingRequest.setNumberOfGuests(guestCount);

        bookingService.createBooking(bookingRequest, userId);
        System.out.println("Booking created for user: " + userId + " for availability: " + availabilityId);
    }
}