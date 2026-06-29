package com.psybergate.staff_engagement.task;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.psybergate.staff_engagement.IntegrationTestBase;
import com.psybergate.staff_engagement.auth.dto.AuthResponse;
import com.psybergate.staff_engagement.auth.dto.LoginRequest;
import com.psybergate.staff_engagement.employee.dto.CreateEmployeeRequest;
import com.psybergate.staff_engagement.employee.dto.EmployeeProfileResponse;
import com.psybergate.staff_engagement.interaction.InteractionType;
import com.psybergate.staff_engagement.interaction.dto.InteractionRequestDto;
import com.psybergate.staff_engagement.interaction.dto.InteractionResponseDto;
import com.psybergate.staff_engagement.task.dto.CreateStandaloneTaskRequest;
import com.psybergate.staff_engagement.task.dto.CreateTaskFromInteractionRequest;
import com.psybergate.staff_engagement.task.dto.TaskResponse;
import com.psybergate.staff_engagement.task.dto.UpdateTaskStatusRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

class TaskControllerIT extends IntegrationTestBase {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private String adminToken;
    private String janeToken;
    private Long adminEmployeeId;
    private Long janeEmployeeId;

    @BeforeEach
    void authenticate() throws Exception {
        AuthResponse admin = login("admin@psybergate.com");
        adminToken = admin.token();
        adminEmployeeId = admin.employeeId();

        AuthResponse jane = login("jane.doe@psybergate.com");
        janeToken = jane.token();
        janeEmployeeId = jane.employeeId();
    }

    private AuthResponse login(String email) throws Exception {
        String body = objectMapper.writeValueAsString(new LoginRequest(email, "password123"));
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);
    }

    private String uniqueEmail() {
        return "task-test-" + UUID.randomUUID() + "@example.com";
    }

    private EmployeeProfileResponse createEmployee(String token) throws Exception {
        String email = uniqueEmail();
        String body = objectMapper.writeValueAsString(
                new CreateEmployeeRequest("Test", "Employee", email, null, null, null));
        MvcResult result = mockMvc.perform(post("/api/employees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), EmployeeProfileResponse.class);
    }

    private InteractionResponseDto createInteraction(Long subjectId, String token) throws Exception {
        String body = objectMapper.writeValueAsString(
                new InteractionRequestDto(subjectId, "A meeting note", InteractionType.MEETING, LocalDate.now()));
        MvcResult result = mockMvc.perform(post("/api/interactions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), InteractionResponseDto.class);
    }

    private TaskResponse createStandaloneTask(Long relatesToId, String title, String token) throws Exception {
        String body = objectMapper.writeValueAsString(
                new CreateStandaloneTaskRequest(relatesToId, title, null, null, null));
        MvcResult result = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);
    }

    // POST /api/tasks/from-interaction

    @Test
    void createFromInteraction_validRequest_returns201WithCorrectFields() throws Exception {
        EmployeeProfileResponse subject = createEmployee(adminToken);
        InteractionResponseDto interaction = createInteraction(subject.id(), adminToken);

        String body = objectMapper.writeValueAsString(
                new CreateTaskFromInteractionRequest(interaction.id(), "Follow up on meeting", null, null, null));

        MvcResult result = mockMvc.perform(post("/api/tasks/from-interaction")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();

        TaskResponse task = objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);
        assertThat(task.id()).isNotNull();
        assertThat(task.title()).isEqualTo("Follow up on meeting");
        assertThat(task.status()).isEqualTo(TaskStatus.OPEN);
        assertThat(task.relatesTo().id()).isEqualTo(subject.id());
        assertThat(task.createdBy().email()).isEqualTo("admin@psybergate.com");
        assertThat(task.fromInteractionId()).isEqualTo(interaction.id());
    }

    @Test
    void createFromInteraction_missingTitle_returns400() throws Exception {
        EmployeeProfileResponse subject = createEmployee(adminToken);
        InteractionResponseDto interaction = createInteraction(subject.id(), adminToken);

        String body = "{\"interactionId\":" + interaction.id() + ",\"title\":\"\"}";

        mockMvc.perform(post("/api/tasks/from-interaction")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createFromInteraction_nonExistentInteraction_returns404() throws Exception {
        String body = objectMapper.writeValueAsString(
                new CreateTaskFromInteractionRequest(999999999L, "Orphan task", null, null, null));

        mockMvc.perform(post("/api/tasks/from-interaction")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    // POST /api/tasks (standalone)

    @Test
    void createStandalone_validRequest_returns201() throws Exception {
        EmployeeProfileResponse subject = createEmployee(adminToken);

        TaskResponse task = createStandaloneTask(subject.id(), "Check in with employee", adminToken);

        assertThat(task.id()).isNotNull();
        assertThat(task.title()).isEqualTo("Check in with employee");
        assertThat(task.status()).isEqualTo(TaskStatus.OPEN);
        assertThat(task.relatesTo().id()).isEqualTo(subject.id());
        assertThat(task.fromInteractionId()).isNull();
    }

    @Test
    void createStandalone_missingTitle_returns400() throws Exception {
        EmployeeProfileResponse subject = createEmployee(adminToken);
        String body = "{\"relatesToId\":" + subject.id() + ",\"title\":\"\"}";

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createStandalone_nonExistentEmployee_returns404() throws Exception {
        String body = objectMapper.writeValueAsString(
                new CreateStandaloneTaskRequest(999999999L, "Orphan task", null, null, null));

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    // GET /api/tasks/mine

    @Test
    void getMyTasks_returnsOnlyTasksForCurrentUser() throws Exception {
        EmployeeProfileResponse subject = createEmployee(adminToken);
        createStandaloneTask(subject.id(), "Not my task", adminToken);
        createStandaloneTask(janeEmployeeId, "Jane's task", adminToken);

        MvcResult result = mockMvc.perform(get("/api/tasks/mine")
                        .header("Authorization", "Bearer " + janeToken))
                .andExpect(status().isOk())
                .andReturn();

        List<TaskResponse> tasks = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                new TypeReference<List<TaskResponse>>() {});
        assertThat(tasks).anyMatch(t -> t.title().equals("Jane's task"));
        assertThat(tasks).noneMatch(t -> t.title().equals("Not my task"));
    }

    // PATCH /api/tasks/{id}/status

    @Test
    void updateStatus_bySubject_returns200WithDoneStatus() throws Exception {
        TaskResponse task = createStandaloneTask(janeEmployeeId, "Jane's update task", adminToken);
        String body = objectMapper.writeValueAsString(new UpdateTaskStatusRequest(TaskStatus.DONE));

        MvcResult result = mockMvc.perform(patch("/api/tasks/" + task.id() + "/status")
                        .header("Authorization", "Bearer " + janeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        TaskResponse updated = objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);
        assertThat(updated.status()).isEqualTo(TaskStatus.DONE);
    }

    @Test
    void updateStatus_byCreator_returns200WithDoneStatus() throws Exception {
        EmployeeProfileResponse subject = createEmployee(adminToken);
        TaskResponse task = createStandaloneTask(subject.id(), "Creator update task", adminToken);
        String body = objectMapper.writeValueAsString(new UpdateTaskStatusRequest(TaskStatus.DONE));

        MvcResult result = mockMvc.perform(patch("/api/tasks/" + task.id() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        TaskResponse updated = objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);
        assertThat(updated.status()).isEqualTo(TaskStatus.DONE);
    }

    @Test
    void updateStatus_byUnrelatedEmployee_returns403() throws Exception {
        EmployeeProfileResponse subject = createEmployee(adminToken);
        TaskResponse task = createStandaloneTask(subject.id(), "Protected task", adminToken);
        String body = objectMapper.writeValueAsString(new UpdateTaskStatusRequest(TaskStatus.DONE));

        mockMvc.perform(patch("/api/tasks/" + task.id() + "/status")
                        .header("Authorization", "Bearer " + janeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateStatus_nonExistentTask_returns404() throws Exception {
        String body = objectMapper.writeValueAsString(new UpdateTaskStatusRequest(TaskStatus.DONE));

        mockMvc.perform(patch("/api/tasks/999999999/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    // T5 — Due date and assignee

    @Test
    void createStandalone_withDueDateAndAssignee_returns201WithBothFields() throws Exception {
        EmployeeProfileResponse subject = createEmployee(adminToken);
        LocalDate dueDate = LocalDate.of(2026, 12, 31);
        String body = objectMapper.writeValueAsString(
                new CreateStandaloneTaskRequest(subject.id(), "Task with extras", null, dueDate, subject.id()));

        MvcResult result = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();

        TaskResponse task = objectMapper.readValue(result.getResponse().getContentAsString(), TaskResponse.class);
        assertThat(task.dueDate()).isEqualTo(dueDate);
        assertThat(task.assignee()).isNotNull();
        assertThat(task.assignee().id()).isEqualTo(subject.id());
    }
}
