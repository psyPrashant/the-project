package com.psybergate.staff_engagement.portfolio.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import org.hibernate.validator.constraints.URL;

public record CreateProjectRequest(
        @NotBlank String name,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        @URL String url
) {

    @AssertTrue(message = "startDate must be before or equal to endDate")
    public boolean isDateRangeValid() {
        return startDate == null || endDate == null || !startDate.isAfter(endDate);
    }
}
