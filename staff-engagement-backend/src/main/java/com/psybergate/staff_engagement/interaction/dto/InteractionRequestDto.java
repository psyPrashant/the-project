package com.psybergate.staff_engagement.interaction.dto;

import com.psybergate.staff_engagement.interaction.InteractionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Request body for logging or updating an interaction.
 */
public record InteractionRequestDto(
        @NotNull(message = "subjectId is required") Long subjectId,
        @NotBlank(message = "note is required") String note,
        @NotNull(message = "type is required") InteractionType type,
        @NotNull(message = "date is required") LocalDate date
) {
}
