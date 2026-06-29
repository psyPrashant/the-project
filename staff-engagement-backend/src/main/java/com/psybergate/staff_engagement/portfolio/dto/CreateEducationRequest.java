package com.psybergate.staff_engagement.portfolio.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateEducationRequest(
        @NotBlank String institution,
        @NotBlank String qualification,
        String fieldOfStudy,
        @Min(1900) @Max(2100) Integer startYear,
        @Min(1900) @Max(2100) Integer endYear,
        String description
) {

    @AssertTrue(message = "startYear must be before or equal to endYear")
    public boolean isYearRangeValid() {
        return startYear == null || endYear == null || startYear <= endYear;
    }
}
