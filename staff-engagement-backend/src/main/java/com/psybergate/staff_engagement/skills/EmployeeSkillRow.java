package com.psybergate.staff_engagement.skills;

public record EmployeeSkillRow(
        Long employeeId,
        String employeeName,
        Long employeeSkillId,
        Long skillId,
        String skillName,
        int years,
        long projectCount
) {
}
