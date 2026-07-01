package com.psybergate.staff_engagement.skills.dto;

public record SkillSummaryResponse(
        Long id,
        String name,
        long employeeCount
) {
}
