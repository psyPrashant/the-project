package com.psybergate.staff_engagement.skills.dto;

public record EmployeeSkillResponse(
        Long id,
        Long skillId,
        String skillName,
        int years,
        long projectCount
) {
}
