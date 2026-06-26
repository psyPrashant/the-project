package com.psybergate.staff_engagement.interaction.dto;

import com.psybergate.staff_engagement.interaction.InteractionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * Request body for logging or updating an interaction.
 */
public record InteractionRequestDto(
        @NotNull(message = "subjectId is required") Long subjectId,
        @NotBlank(message = "note is required")
        @Size(max = 2000, message = "note must be 2000 characters or less") String note,
        @NotNull(message = "type is required") InteractionType type,
        @NotNull(message = "date is required")
        @PastOrPresent(message = "date cannot be in the future") LocalDate date
) {
}
