package com.Mybeez.TeamB.TeamB.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.cloudinary.Cloudinary;

@RestController
@RequestMapping("/api/cloudinary")
@CrossOrigin(origins = "http://localhost:3000")
public class CloudinaryController {

    @Autowired
    private Cloudinary cloudinary;

    @PostMapping("/sign")
    public ResponseEntity<Map<String, Object>> getUploadSignature(Authentication authentication) {
        // 1. Manual, explicit security check
        boolean isHost = authentication.getAuthorities().stream()
                .anyMatch(ga -> ga.getAuthority().equals("ROLE_HOST"));

        // 2. If the check fails, manually return the 403 Forbidden error
        if (!isHost) {
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("error", "Forbidden");
            errorBody.put("message", "You do not have the HOST role to perform this action.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorBody);
        }

        String transformation = "w_1920,q_auto,f_auto";

        // 3. If the check passes, the original logic runs
        long timestamp = System.currentTimeMillis() / 1000;
        Map<String, Object> paramsToSign = new HashMap<>();
        paramsToSign.put("timestamp", timestamp);
        paramsToSign.put("transformation", transformation);

        try {
            String signature = cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret);
            Map<String, Object> response = new HashMap<>();
            response.put("signature", signature);
            response.put("timestamp", timestamp);
            response.put("transformation", transformation);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    @PostMapping("/delete-sign")
    public ResponseEntity<Map<String, String>> getDeleteSignature(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        // Security check for delete
        boolean isHost = authentication.getAuthorities().stream()
                .anyMatch(ga -> ga.getAuthority().equals("ROLE_HOST"));

        if (!isHost) {
            Map<String, String> errorBody = new HashMap<>();
            errorBody.put("error", "Forbidden");
            errorBody.put("message", "You do not have the HOST role to perform this action.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorBody);
        }

        String publicId = request.get("publicId");
        long timestamp = System.currentTimeMillis() / 1000L;

        try {
            // Create parameters for deletion signature
            Map<String, Object> paramsToSign = new HashMap<>();
            paramsToSign.put("public_id", publicId);
            paramsToSign.put("timestamp", timestamp);

            // Generate signature using Cloudinary's method
            String signature = cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret);

            Map<String, String> response = new HashMap<>();
            response.put("signature", signature);
            response.put("timestamp", String.valueOf(timestamp));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error generating delete signature: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
