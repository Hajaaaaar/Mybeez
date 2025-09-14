package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.HostDashboardDTO;
import com.Mybeez.TeamB.TeamB.service.HostDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/host/dashboard")
public class HostDashboardController {

    @Autowired
    private HostDashboardService hostDashboardService;

    @GetMapping
    @PreAuthorize("hasRole('HOST')") // This endpoint is secure and only accessible by hosts
    public ResponseEntity<HostDashboardDTO> getDashboardData(@AuthenticationPrincipal User currentUser) {
        HostDashboardDTO dashboardData = hostDashboardService.getDashboardData(currentUser);
        return ResponseEntity.ok(dashboardData);
    }
}