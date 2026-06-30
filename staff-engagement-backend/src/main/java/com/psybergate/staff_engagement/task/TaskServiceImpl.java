package com.psybergate.staff_engagement.task;

import com.psybergate.staff_engagement.common.exception.ForbiddenOperationException;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import com.psybergate.staff_engagement.interaction.InteractionService;
import com.psybergate.staff_engagement.interaction.dto.InteractionResponseDto;
import com.psybergate.staff_engagement.task.dto.CreateStandaloneTaskRequest;
import com.psybergate.staff_engagement.task.dto.CreateTaskFromInteractionRequest;
import com.psybergate.staff_engagement.task.dto.TaskResponse;
import com.psybergate.staff_engagement.task.dto.UpdateTaskStatusRequest;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final EmployeeService employeeService;
    private final InteractionService interactionService;

    @Override
    public TaskResponse createFromInteraction(CreateTaskFromInteractionRequest request, Employee currentEmployee) {
        InteractionResponseDto interaction = interactionService.findById(request.interactionId());
        Employee relatesTo = employeeService.findById(interaction.subject().id());
        Employee assignee = resolveAssignee(request.assigneeId());

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .relatesTo(relatesTo)
                .createdBy(currentEmployee)
                .fromInteractionId(request.interactionId())
                .dueDate(request.dueDate())
                .assignee(assignee)
                .build();

        return toResponse(taskRepository.save(task));
    }

    @Override
    public TaskResponse createStandalone(CreateStandaloneTaskRequest request, Employee currentEmployee) {
        Employee relatesTo = employeeService.findById(request.relatesToId());
        Employee assignee = resolveAssignee(request.assigneeId());

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .relatesTo(relatesTo)
                .createdBy(currentEmployee)
                .dueDate(request.dueDate())
                .assignee(assignee)
                .build();

        return toResponse(taskRepository.save(task));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getMyTasks(Employee currentEmployee) {
        return taskRepository.findByRelatesToIdOrAssigneeId(currentEmployee.getId(), currentEmployee.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public TaskResponse updateStatus(Long id, UpdateTaskStatusRequest request, Employee currentEmployee) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));

        boolean isSubject = task.getRelatesTo().getId().equals(currentEmployee.getId());
        boolean isCreator = task.getCreatedBy().getId().equals(currentEmployee.getId());
        if (!isSubject && !isCreator) {
            throw new ForbiddenOperationException("Only the task subject or creator may update it");
        }

        task.setStatus(request.status());
        return toResponse(taskRepository.save(task));
    }

    private Employee resolveAssignee(Long assigneeId) {
        if (assigneeId == null) {
            return null;
        }
        return employeeService.findById(assigneeId);
    }

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                employeeService.toResponse(task.getRelatesTo()),
                employeeService.toResponse(task.getCreatedBy()),
                task.getFromInteractionId(),
                task.getDueDate(),
                task.getAssignee() != null ? employeeService.toResponse(task.getAssignee()) : null,
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
