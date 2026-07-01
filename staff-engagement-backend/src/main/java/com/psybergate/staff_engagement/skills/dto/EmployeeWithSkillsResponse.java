package com.psybergate.staff_engagement.skills.dto;

import java.util.List;

public record EmployeeWithSkillsResponse(
        Long employeeId,
        String employeeName,
        List<EmployeeSkillResponse> skills
) {
}
