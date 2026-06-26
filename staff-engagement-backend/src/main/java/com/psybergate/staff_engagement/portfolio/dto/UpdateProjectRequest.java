package com.psybergate.staff_engagement.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import org.hibernate.validator.constraints.URL;

public record UpdateProjectRequest(
        @NotBlank String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        @URL String url
) {
}
