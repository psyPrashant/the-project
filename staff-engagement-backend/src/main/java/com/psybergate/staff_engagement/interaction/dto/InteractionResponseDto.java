package com.psybergate.staff_engagement.interaction.dto;

import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import com.psybergate.staff_engagement.interaction.InteractionType;
import java.time.LocalDate;

/**
 * API representation of a persisted interaction.
 */
public record InteractionResponseDto(
        Long id,
        EmployeeResponse author,
        EmployeeResponse subject,
        String note,
        InteractionType type,
        LocalDate date
) {
}
