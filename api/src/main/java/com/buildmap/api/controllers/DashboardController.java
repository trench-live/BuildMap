package com.buildmap.api.controllers;

import com.buildmap.api.dto.dashboard.AdminDashboardStatsDto;
import com.buildmap.api.dto.dashboard.UserDashboardStatsDto;
import com.buildmap.api.entities.user.User;
import com.buildmap.api.services.AuthorizationService;
import com.buildmap.api.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AuthorizationService authorizationService;

    @GetMapping("/admin")
    public ResponseEntity<AdminDashboardStatsDto> getAdminStats() {
        User currentUser = authorizationService.getCurrentUser();
        authorizationService.requireAdmin(currentUser);
        return ResponseEntity.ok(dashboardService.getAdminStats());
    }

    @GetMapping("/me")
    public ResponseEntity<UserDashboardStatsDto> getCurrentUserStats() {
        User currentUser = authorizationService.getCurrentUser();
        return ResponseEntity.ok(dashboardService.getUserStats(currentUser.getId()));
    }
}
