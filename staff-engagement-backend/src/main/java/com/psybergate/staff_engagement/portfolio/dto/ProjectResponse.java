package com.psybergate.staff_engagement.portfolio.dto;

import java.time.LocalDate;

public record ProjectResponse(
        Long id,
        Long employeeId,
        String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        String url
) {
}
