package com.psybergate.staff_engagement.skills.dto;

public record SkillSearchResultResponse(
        Long employeeId,
        String employeeName,
        String skillName,
        int years,
        long projectCount
) {
}
