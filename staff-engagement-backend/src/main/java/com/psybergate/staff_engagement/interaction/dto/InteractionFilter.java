package com.psybergate.staff_engagement.interaction.dto;

import com.psybergate.staff_engagement.interaction.InteractionType;
import java.time.LocalDate;

/**
 * Optional filters for an employee's interaction timeline.
 */
public record InteractionFilter(
        InteractionType type,
        Long authorId,
        LocalDate date
) {
}
