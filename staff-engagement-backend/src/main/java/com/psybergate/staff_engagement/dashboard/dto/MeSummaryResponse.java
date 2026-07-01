package com.psybergate.staff_engagement.dashboard.dto;

public record MeSummaryResponse(
        Long employeeId,
        String employeeName,
        long skillCount,
        long openTaskCount,
        long recentInteractionCount
) {
}
