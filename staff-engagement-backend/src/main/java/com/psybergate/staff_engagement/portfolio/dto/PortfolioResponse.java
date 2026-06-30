package com.psybergate.staff_engagement.portfolio.dto;

import java.util.List;

public record PortfolioResponse(
        Long employeeId,
        List<EducationResponse> education,
        List<ProjectResponse> projects,
        List<ShowcaseLinkResponse> links
) {
}
