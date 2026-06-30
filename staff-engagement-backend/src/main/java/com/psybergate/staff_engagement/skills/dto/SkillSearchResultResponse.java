package com.psybergate.staff_engagement.skills.dto;

public record SkillSearchResultResponse(
        Long employeeId,
        String employeeName,
        int years,
        long projectCount
) {
}
