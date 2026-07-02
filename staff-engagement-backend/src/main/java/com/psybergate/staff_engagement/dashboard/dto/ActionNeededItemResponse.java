package com.psybergate.staff_engagement.dashboard.dto;

public record ActionNeededItemResponse(
        Long employeeId,
        String employeeName,
        String reason
) {
}
