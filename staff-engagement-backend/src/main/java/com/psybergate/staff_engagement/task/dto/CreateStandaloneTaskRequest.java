package com.psybergate.staff_engagement.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateStandaloneTaskRequest(
        @NotNull(message = "relatesToId is required") Long relatesToId,
        @NotBlank(message = "title is required")
        @Size(max = 255, message = "title must be 255 characters or less") String title,
        String description,
        LocalDate dueDate,
        Long assigneeId
) {
}
