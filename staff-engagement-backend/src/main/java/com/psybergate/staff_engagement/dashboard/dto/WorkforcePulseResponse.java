package com.psybergate.staff_engagement.dashboard.dto;

public record WorkforcePulseResponse(
        long totalEmployees,
        long employeesWithSkills,
        long openTasks,
        long interactionsThisWeek
) {
}
