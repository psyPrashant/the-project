package com.psybergate.staff_engagement.dashboard.dto;

public record SkillCoverageItemResponse(
        Long skillId,
        String skillName,
        long employeeCount
) {
}
