package com.psybergate.staff_engagement.interaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.psybergate.staff_engagement.IntegrationTestBase;
import com.psybergate.staff_engagement.auth.dto.AuthResponse;
import com.psybergate.staff_engagement.auth.dto.LoginRequest;
import com.psybergate.staff_engagement.employee.dto.CreateEmployeeRequest;
import com.psybergate.staff_engagement.employee.dto.EmployeeProfileResponse;
import com.psybergate.staff_engagement.interaction.dto.InteractionRequestDto;
import com.psybergate.staff_engagement.interaction.dto.InteractionResponseDto;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

class InteractionCrudIT extends IntegrationTestBase {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private String adminToken;
    private String janeToken;

    @BeforeEach
    void authenticate() throws Exception {
        adminToken = login("admin@psybergate.com");
        janeToken = login("jane.doe@psybergate.com");
    }

    private String login(String email) throws Exception {
        String body = objectMapper.writeValueAsString(new LoginRequest(email, "password123"));
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class).token();
    }

    private String uniqueEmail() {
        return "test-" + UUID.randomUUID() + "@example.com";
    }

    private EmployeeProfileResponse createEmployee(String firstName, String lastName, String email, String token) throws Exception {
        String body = objectMapper.writeValueAsString(
                new CreateEmployeeRequest(firstName, lastName, email, null, null, null));
        MvcResult result = mockMvc.perform(post("/api/employees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), EmployeeProfileResponse.class);
    }

    private InteractionResponseDto createInteraction(Long subjectId, String note, InteractionType type, LocalDate date, String token) throws Exception {
        String body = objectMapper.writeValueAsString(new InteractionRequestDto(subjectId, note, type, date));
        MvcResult result = mockMvc.perform(post("/api/interactions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), InteractionResponseDto.class);
    }

    // POST /api/interactions

    @Test
    void create_validRequest_returns201WithAuthorAndSubject() throws Exception {
        EmployeeProfileResponse subject = createEmployee("Subject", "One", uniqueEmail(), adminToken);
        LocalDate date = LocalDate.of(2026, 6, 25);

        InteractionResponseDto result = createInteraction(subject.id(), "Discussed project goals", InteractionType.MEETING, date, adminToken);

        assertThat(result.id()).isNotNull();
        assertThat(result.author().email()).isEqualTo("admin@psybergate.com");
        assertThat(result.subject().id()).isEqualTo(subject.id());
        assertThat(result.note()).isEqualTo("Discussed project goals");
        assertThat(result.type()).isEqualTo(InteractionType.MEETING);
        assertThat(result.date()).isEqualTo(date);
    }

    @Test
    void create_selfInteraction_isAllowed() throws Exception {
        // admin@psybergate.com is the seeded employee with id 1; subject = author = 1 is a valid self-interaction.
        InteractionResponseDto result = createInteraction(1L, "Personal log entry", InteractionType.NOTE, LocalDate.now(), adminToken);

        assertThat(result.author().id()).isEqualTo(1L);
        assertThat(result.subject().id()).isEqualTo(1L);
    }

    @Test
    void create_missingNote_returns400() throws Exception {
        EmployeeProfileResponse subject = createEmployee("Subject", "Two", uniqueEmail(), adminToken);
        String body = objectMapper.writeValueAsString(new InteractionRequestDto(subject.id(), "", InteractionType.NOTE, LocalDate.now()));

        mockMvc.perform(post("/api/interactions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_missingSubjectId_returns400() throws Exception {
        String body = objectMapper.writeValueAsString(new InteractionRequestDto(null, "Note", InteractionType.NOTE, LocalDate.now()));

        mockMvc.perform(post("/api/interactions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_nonExistentSubject_returns404() throws Exception {
        String body = objectMapper.writeValueAsString(new InteractionRequestDto(999999999L, "Note", InteractionType.NOTE, LocalDate.now()));

        mockMvc.perform(post("/api/interactions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_unauthenticated_returns401() throws Exception {
        String body = objectMapper.writeValueAsString(new InteractionRequestDto(1L, "Note", InteractionType.NOTE, LocalDate.now()));

        mockMvc.perform(post("/api/interactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    // GET /api/interactions?subjectId={id}

    @Test
    void findBySubject_returnsInteractionsForSubject() throws Exception {
        EmployeeProfileResponse subject = createEmployee("Timeline", "Subject", uniqueEmail(), adminToken);
        createInteraction(subject.id(), "First note", InteractionType.NOTE, LocalDate.now().minusDays(2), adminToken);
        createInteraction(subject.id(), "Second note", InteractionType.NOTE, LocalDate.now(), adminToken);

        MvcResult result = mockMvc.perform(get("/api/interactions")
                        .param("subjectId", subject.id().toString())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andReturn();

        List<InteractionResponseDto> list = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                new TypeReference<List<InteractionResponseDto>>() {});
        assertThat(list).hasSize(2);
        assertThat(list.get(0).date()).isAfterOrEqualTo(list.get(1).date());
    }

    // PUT /api/interactions/{id}

    @Test
    void update_byAuthor_returns200WithUpdatedInteraction() throws Exception {
        EmployeeProfileResponse subject = createEmployee("Update", "Subject", uniqueEmail(), adminToken);
        InteractionResponseDto created = createInteraction(subject.id(), "Original", InteractionType.NOTE, LocalDate.now(), adminToken);
        String body = objectMapper.writeValueAsString(new InteractionRequestDto(subject.id(), "Updated", InteractionType.CALL, LocalDate.now().plusDays(1)));

        MvcResult result = mockMvc.perform(put("/api/interactions/" + created.id())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        InteractionResponseDto updated = objectMapper.readValue(result.getResponse().getContentAsString(), InteractionResponseDto.class);
        assertThat(updated.note()).isEqualTo("Updated");
        assertThat(updated.type()).isEqualTo(InteractionType.CALL);
    }

    @Test
    void update_byNonAuthor_returns403() throws Exception {
        EmployeeProfileResponse subject = createEmployee("Locked", "Subject", uniqueEmail(), adminToken);
        InteractionResponseDto created = createInteraction(subject.id(), "Original", InteractionType.NOTE, LocalDate.now(), janeToken);
        String body = objectMapper.writeValueAsString(new InteractionRequestDto(subject.id(), "Hacked", InteractionType.NOTE, LocalDate.now()));

        mockMvc.perform(put("/api/interactions/" + created.id())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void update_unknownInteraction_returns404() throws Exception {
        String body = objectMapper.writeValueAsString(new InteractionRequestDto(1L, "Updated", InteractionType.NOTE, LocalDate.now()));

        mockMvc.perform(put("/api/interactions/999999999")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    // DELETE /api/interactions/{id}

    @Test
    void delete_byAuthor_returns204() throws Exception {
        EmployeeProfileResponse subject = createEmployee("Delete", "Subject", uniqueEmail(), adminToken);
        InteractionResponseDto created = createInteraction(subject.id(), "To delete", InteractionType.NOTE, LocalDate.now(), adminToken);

        mockMvc.perform(delete("/api/interactions/" + created.id())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/interactions/" + created.id())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_byNonAuthor_returns403() throws Exception {
        EmployeeProfileResponse subject = createEmployee("Protected", "Subject", uniqueEmail(), adminToken);
        InteractionResponseDto created = createInteraction(subject.id(), "Protected", InteractionType.NOTE, LocalDate.now(), janeToken);

        mockMvc.perform(delete("/api/interactions/" + created.id())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isForbidden());
    }
}
