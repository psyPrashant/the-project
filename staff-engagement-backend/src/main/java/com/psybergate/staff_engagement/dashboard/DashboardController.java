package com.psybergate.staff_engagement.dashboard;

import com.psybergate.staff_engagement.auth.CurrentEmployee;
import com.psybergate.staff_engagement.dashboard.dto.DashboardResponse;
import com.psybergate.staff_engagement.employee.Employee;
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

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(@CurrentEmployee Employee currentEmployee) {
        return ResponseEntity.ok(dashboardService.getDashboard(currentEmployee));
    }
}
