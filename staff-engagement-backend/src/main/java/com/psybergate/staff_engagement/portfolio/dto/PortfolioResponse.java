package com.psybergate.staff_engagement.portfolio.dto;

import com.psybergate.staff_engagement.skills.dto.EmployeeSkillResponse;
import java.util.List;

public record PortfolioResponse(
        Long employeeId,
        List<EducationResponse> education,
        List<ProjectResponse> projects,
        List<ShowcaseLinkResponse> links,
        List<EmployeeSkillResponse> skills
) {
    public PortfolioResponse withSkills(List<EmployeeSkillResponse> skills) {
        return new PortfolioResponse(employeeId, education, projects, links, skills);
    }
}
