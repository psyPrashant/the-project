package com.psybergate.staff_engagement.task.dto;

import com.psybergate.staff_engagement.task.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateTaskStatusRequest(
        @NotNull(message = "status is required") TaskStatus status
) {
}
