package com.psybergate.staff_engagement.portfolio.dto;

public record EducationResponse(
        Long id,
        Long employeeId,
        String institution,
        String qualification,
        String fieldOfStudy,
        Integer startYear,
        Integer endYear,
        String description
) {
}
