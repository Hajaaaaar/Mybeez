package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.service.MetabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/metabase")
public class MetabaseController {

    @Autowired
    private MetabaseService metabaseService;

    // Use the ID of the dashboard you created in Metabase
    private static final long HOST_DASHBOARD_ID = 2; // <-- IMPORTANT: Update with your dashboard's ID

    @GetMapping("/host-dashboard-url")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<?> getHostDashboardUrl(@AuthenticationPrincipal User currentUser) {
        String dashboardUrl = metabaseService.getDashboardUrl(HOST_DASHBOARD_ID, currentUser);

        // Return the single URL in a simple map
        return ResponseEntity.ok(Map.of("url", dashboardUrl));
    }
}
