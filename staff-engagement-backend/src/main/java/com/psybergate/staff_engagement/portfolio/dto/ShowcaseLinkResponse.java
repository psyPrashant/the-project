package com.psybergate.staff_engagement.portfolio.dto;

public record ShowcaseLinkResponse(
        Long id,
        Long employeeId,
        String label,
        String url,
        Integer sortOrder
) {
}
