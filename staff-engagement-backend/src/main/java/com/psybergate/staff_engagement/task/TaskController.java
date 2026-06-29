package com.psybergate.staff_engagement.task;

import com.psybergate.staff_engagement.auth.CurrentEmployee;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.task.dto.CreateStandaloneTaskRequest;
import com.psybergate.staff_engagement.task.dto.CreateTaskFromInteractionRequest;
import com.psybergate.staff_engagement.task.dto.TaskResponse;
import com.psybergate.staff_engagement.task.dto.UpdateTaskStatusRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/from-interaction")
    public ResponseEntity<TaskResponse> createFromInteraction(
            @Valid @RequestBody CreateTaskFromInteractionRequest request,
            @CurrentEmployee Employee currentEmployee) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createFromInteraction(request, currentEmployee));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createStandalone(
            @Valid @RequestBody CreateStandaloneTaskRequest request,
            @CurrentEmployee Employee currentEmployee) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createStandalone(request, currentEmployee));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<TaskResponse>> getMyTasks(@CurrentEmployee Employee currentEmployee) {
        return ResponseEntity.ok(taskService.getMyTasks(currentEmployee));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskStatusRequest request,
            @CurrentEmployee Employee currentEmployee) {
        return ResponseEntity.ok(taskService.updateStatus(id, request, currentEmployee));
    }
}
