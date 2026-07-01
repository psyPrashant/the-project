package com.psybergate.staff_engagement.skills.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateEmployeeSkillRequest(
        @NotNull @Min(0) Integer years
) {
}
