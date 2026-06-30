package com.psybergate.staff_engagement.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import com.psybergate.staff_engagement.common.exception.ForbiddenOperationException;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import com.psybergate.staff_engagement.interaction.InteractionService;
import com.psybergate.staff_engagement.interaction.InteractionType;
import com.psybergate.staff_engagement.interaction.dto.InteractionResponseDto;
import com.psybergate.staff_engagement.task.dto.CreateStandaloneTaskRequest;
import com.psybergate.staff_engagement.task.dto.CreateTaskFromInteractionRequest;
import com.psybergate.staff_engagement.task.dto.TaskResponse;
import com.psybergate.staff_engagement.task.dto.UpdateTaskStatusRequest;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TaskServiceImplTest {

    @Mock private TaskRepository taskRepository;
    @Mock private EmployeeService employeeService;
    @Mock private InteractionService interactionService;

    @InjectMocks
    private TaskServiceImpl taskService;

    private final Employee creator = Employee.builder()
            .id(1L).email("creator@example.com").firstName("Creator").lastName("User").build();

    private final Employee subject = Employee.builder()
            .id(2L).email("subject@example.com").firstName("Subject").lastName("User").build();

    private final Employee unrelated = Employee.builder()
            .id(3L).email("other@example.com").firstName("Other").lastName("User").build();

    private final EmployeeResponse creatorResponse =
            new EmployeeResponse(1L, "creator@example.com", "Creator", "User");

    private final EmployeeResponse subjectResponse =
            new EmployeeResponse(2L, "subject@example.com", "Subject", "User");

    private final LocalDateTime now = LocalDateTime.now();

    private Task savedTask(Long id, Employee relatesTo, Employee createdBy, Long fromInteractionId) {
        return Task.builder()
                .id(id)
                .title("Test task")
                .status(TaskStatus.OPEN)
                .relatesTo(relatesTo)
                .createdBy(createdBy)
                .fromInteractionId(fromInteractionId)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    private InteractionResponseDto interactionDto(Long id, Employee interactionSubject, Employee author) {
        return new InteractionResponseDto(
                id,
                new EmployeeResponse(author.getId(), author.getEmail(), author.getFirstName(), author.getLastName()),
                new EmployeeResponse(interactionSubject.getId(), interactionSubject.getEmail(), interactionSubject.getFirstName(), interactionSubject.getLastName()),
                "A note",
                InteractionType.MEETING,
                LocalDate.now()
        );
    }

    @Test
    void createFromInteraction_happyPath_setsRelatesToFromInteractionSubject() {
        InteractionResponseDto interaction = interactionDto(10L, subject, creator);
        Task saved = savedTask(99L, subject, creator, 10L);

        when(interactionService.findById(10L)).thenReturn(interaction);
        when(employeeService.findById(subject.getId())).thenReturn(subject);
        when(taskRepository.save(any(Task.class))).thenReturn(saved);
        lenient().when(employeeService.toResponse(subject)).thenReturn(subjectResponse);
        lenient().when(employeeService.toResponse(creator)).thenReturn(creatorResponse);

        CreateTaskFromInteractionRequest request = new CreateTaskFromInteractionRequest(10L, "Test task", null, null, null);
        TaskResponse result = taskService.createFromInteraction(request, creator);

        assertThat(result.id()).isEqualTo(99L);
        assertThat(result.relatesTo().id()).isEqualTo(subject.getId());
        assertThat(result.createdBy().id()).isEqualTo(creator.getId());
        assertThat(result.fromInteractionId()).isEqualTo(10L);
        assertThat(result.status()).isEqualTo(TaskStatus.OPEN);
    }

    @Test
    void createFromInteraction_nonExistentInteraction_throwsEntityNotFoundException() {
        when(interactionService.findById(999L)).thenThrow(new EntityNotFoundException("Interaction not found: 999"));

        CreateTaskFromInteractionRequest request = new CreateTaskFromInteractionRequest(999L, "Title", null, null, null);

        assertThatThrownBy(() -> taskService.createFromInteraction(request, creator))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void createStandalone_happyPath_setsRelatesToAndCreatedBy() {
        Task saved = savedTask(100L, subject, creator, null);

        when(employeeService.findById(subject.getId())).thenReturn(subject);
        when(taskRepository.save(any(Task.class))).thenReturn(saved);
        lenient().when(employeeService.toResponse(subject)).thenReturn(subjectResponse);
        lenient().when(employeeService.toResponse(creator)).thenReturn(creatorResponse);

        CreateStandaloneTaskRequest request = new CreateStandaloneTaskRequest(subject.getId(), "Test task", null, null, null);
        TaskResponse result = taskService.createStandalone(request, creator);

        assertThat(result.id()).isEqualTo(100L);
        assertThat(result.relatesTo().id()).isEqualTo(subject.getId());
        assertThat(result.createdBy().id()).isEqualTo(creator.getId());
        assertThat(result.fromInteractionId()).isNull();
    }

    @Test
    void createStandalone_nonExistentEmployee_throwsEntityNotFoundException() {
        when(employeeService.findById(999L)).thenThrow(new EntityNotFoundException("Employee not found: 999"));

        CreateStandaloneTaskRequest request = new CreateStandaloneTaskRequest(999L, "Title", null, null, null);

        assertThatThrownBy(() -> taskService.createStandalone(request, creator))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void getMyTasks_returnsTasksWhereCurrentUserIsSubjectOrAssignee() {
        Task myTask = savedTask(1L, creator, subject, null);
        Task otherTask = savedTask(2L, subject, creator, null);

        when(taskRepository.findByRelatesToIdOrAssigneeId(creator.getId(), creator.getId()))
                .thenReturn(List.of(myTask));
        lenient().when(employeeService.toResponse(creator)).thenReturn(creatorResponse);
        lenient().when(employeeService.toResponse(subject)).thenReturn(subjectResponse);

        List<TaskResponse> result = taskService.getMyTasks(creator);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).relatesTo().id()).isEqualTo(creator.getId());
    }

    @Test
    void getMyTasks_noTasks_returnsEmptyList() {
        when(taskRepository.findByRelatesToIdOrAssigneeId(creator.getId(), creator.getId()))
                .thenReturn(List.of());

        List<TaskResponse> result = taskService.getMyTasks(creator);

        assertThat(result).isEmpty();
    }

    @Test
    void getByRelatesTo_returnsTasksForEmployee() {
        Task task1 = savedTask(1L, subject, creator, null);
        Task task2 = savedTask(2L, subject, unrelated, null);

        when(taskRepository.findByRelatesToId(subject.getId())).thenReturn(List.of(task1, task2));
        lenient().when(employeeService.toResponse(subject)).thenReturn(subjectResponse);
        lenient().when(employeeService.toResponse(creator)).thenReturn(creatorResponse);
        lenient().when(employeeService.toResponse(unrelated))
                .thenReturn(new EmployeeResponse(3L, "other@example.com", "Other", "User"));

        List<TaskResponse> result = taskService.getByRelatesTo(subject.getId());

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(t -> t.relatesTo().id().equals(subject.getId()));
    }

    @Test
    void getByRelatesTo_noTasks_returnsEmptyList() {
        when(taskRepository.findByRelatesToId(subject.getId())).thenReturn(List.of());

        List<TaskResponse> result = taskService.getByRelatesTo(subject.getId());

        assertThat(result).isEmpty();
    }

    @Test
    void updateStatus_bySubject_updatesStatus() {
        Task task = savedTask(1L, subject, creator, null);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        lenient().when(employeeService.toResponse(subject)).thenReturn(subjectResponse);
        lenient().when(employeeService.toResponse(creator)).thenReturn(creatorResponse);

        UpdateTaskStatusRequest request = new UpdateTaskStatusRequest(TaskStatus.DONE);
        TaskResponse result = taskService.updateStatus(1L, request, subject);

        assertThat(result.status()).isEqualTo(TaskStatus.DONE);
    }

    @Test
    void updateStatus_byCreator_updatesStatus() {
        Task task = savedTask(1L, subject, creator, null);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);
        lenient().when(employeeService.toResponse(subject)).thenReturn(subjectResponse);
        lenient().when(employeeService.toResponse(creator)).thenReturn(creatorResponse);

        UpdateTaskStatusRequest request = new UpdateTaskStatusRequest(TaskStatus.DONE);
        TaskResponse result = taskService.updateStatus(1L, request, creator);

        assertThat(result.status()).isEqualTo(TaskStatus.DONE);
    }

    @Test
    void updateStatus_byUnrelatedEmployee_throwsForbiddenOperationException() {
        Task task = savedTask(1L, subject, creator, null);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        UpdateTaskStatusRequest request = new UpdateTaskStatusRequest(TaskStatus.DONE);

        assertThatThrownBy(() -> taskService.updateStatus(1L, request, unrelated))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasMessageContaining("subject or creator");
    }

    @Test
    void updateStatus_nonExistentTask_throwsEntityNotFoundException() {
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.updateStatus(999L, new UpdateTaskStatusRequest(TaskStatus.DONE), creator))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
