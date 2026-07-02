package com.psybergate.staff_engagement.dashboard.dto;

import java.time.LocalDateTime;

public record ActivityItemResponse(
        String type,
        String actorName,
        Long targetEmployeeId,
        String targetEmployeeName,
        String description,
        LocalDateTime occurredAt
) {
}
