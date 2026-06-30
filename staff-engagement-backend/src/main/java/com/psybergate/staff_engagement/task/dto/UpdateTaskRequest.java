package com.psybergate.staff_engagement.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateTaskRequest(
        @NotBlank @Size(max = 255) String title,
        String description,
        LocalDate dueDate,
        Long assigneeId
) {}
