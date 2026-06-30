package com.psybergate.staff_engagement.task.dto;

import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import com.psybergate.staff_engagement.task.TaskStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        EmployeeResponse relatesTo,
        EmployeeResponse createdBy,
        Long fromInteractionId,
        LocalDate dueDate,
        EmployeeResponse assignee,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
