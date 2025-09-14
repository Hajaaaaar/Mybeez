package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.payload.GroupAvailabilityResponse;
import com.Mybeez.TeamB.TeamB.service.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {

    @Autowired
    private AvailabilityService availabilityService;

    @GetMapping("/{experienceId}/group")
    public ResponseEntity<GroupAvailabilityResponse> getGroupAvailability(@PathVariable Long experienceId) {
        return ResponseEntity.ok(availabilityService.getGroupAvailability(experienceId));
    }

    @GetMapping("/{experienceId}/private")
    public ResponseEntity<GroupAvailabilityResponse> getPrivateAvailability(@PathVariable Long experienceId) {
        return ResponseEntity.ok(availabilityService.getPrivateAvailability(experienceId));
    }
}