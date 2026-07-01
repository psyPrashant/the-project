package com.psybergate.staff_engagement.skills;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.psybergate.staff_engagement.common.exception.GlobalExceptionHandler;
import com.psybergate.staff_engagement.skills.dto.AddEmployeeSkillRequest;
import com.psybergate.staff_engagement.skills.dto.EmployeeSkillResponse;
import com.psybergate.staff_engagement.skills.dto.SkillSearchResultResponse;
import com.psybergate.staff_engagement.skills.dto.SkillSummaryResponse;
import com.psybergate.staff_engagement.skills.dto.UpdateEmployeeSkillRequest;
import java.time.Clock;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@ExtendWith(MockitoExtension.class)
class SkillControllerTest {

    @Mock
    private SkillService skillService;

    @InjectMocks
    private SkillController skillController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private static final Long EMPLOYEE_ID = 10L;
    private static final Long SKILL_ID = 20L;
    private static final Long PROJECT_ID = 30L;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(skillController)
                .setValidator(new LocalValidatorFactoryBean())
                .setControllerAdvice(new GlobalExceptionHandler(Clock.systemDefaultZone()))
                .build();
    }

    // ── Get skills for employee ────────────────────────────────────────────

    @Test
    void getSkillsForEmployee_returnsOkWithList() throws Exception {
        EmployeeSkillResponse skill = new EmployeeSkillResponse(SKILL_ID, 1L, "Angular", 4, 2);
        when(skillService.getSkillsForEmployee(EMPLOYEE_ID)).thenReturn(List.of(skill));

        mockMvc.perform(get("/api/employees/{id}/skills", EMPLOYEE_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].skillName").value("Angular"))
                .andExpect(jsonPath("$[0].years").value(4));
    }

    // ── Add skill ─────────────────────────────────────────────────────────

    @Test
    void addSkill_validRequest_returns201WithLocation() throws Exception {
        AddEmployeeSkillRequest request = new AddEmployeeSkillRequest("Go", 3);
        EmployeeSkillResponse response = new EmployeeSkillResponse(SKILL_ID, 2L, "Go", 3, 0);
        when(skillService.addSkillToEmployee(eq(EMPLOYEE_ID), any(AddEmployeeSkillRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/employees/{id}/skills", EMPLOYEE_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location",
                        "/api/employees/" + EMPLOYEE_ID + "/skills/" + SKILL_ID))
                .andExpect(jsonPath("$.skillName").value("Go"));
    }

    @Test
    void addSkill_negativeYears_returns400() throws Exception {
        String body = "{\"skillName\":\"Go\",\"years\":-1}";

        mockMvc.perform(post("/api/employees/{id}/skills", EMPLOYEE_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    // ── Update skill ──────────────────────────────────────────────────────

    @Test
    void updateSkill_validRequest_returnsOk() throws Exception {
        UpdateEmployeeSkillRequest request = new UpdateEmployeeSkillRequest(7);
        EmployeeSkillResponse response = new EmployeeSkillResponse(SKILL_ID, 1L, "Angular", 7, 1);
        when(skillService.updateEmployeeSkill(eq(EMPLOYEE_ID), eq(SKILL_ID), any(UpdateEmployeeSkillRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/employees/{id}/skills/{skillId}", EMPLOYEE_ID, SKILL_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.years").value(7));
    }

    @Test
    void updateSkill_negativeYears_returns400() throws Exception {
        String body = "{\"years\":-1}";

        mockMvc.perform(put("/api/employees/{id}/skills/{skillId}", EMPLOYEE_ID, SKILL_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    // ── Delete skill ──────────────────────────────────────────────────────

    @Test
    void deleteSkill_existing_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/employees/{id}/skills/{skillId}", EMPLOYEE_ID, SKILL_ID))
                .andExpect(status().isNoContent());

        verify(skillService).removeEmployeeSkill(EMPLOYEE_ID, SKILL_ID);
    }

    // ── Link project ──────────────────────────────────────────────────────

    @Test
    void linkProject_returnsOkWithUpdatedProjectCount() throws Exception {
        EmployeeSkillResponse response = new EmployeeSkillResponse(SKILL_ID, 1L, "Angular", 4, 1);
        when(skillService.linkProject(EMPLOYEE_ID, SKILL_ID, PROJECT_ID)).thenReturn(response);

        mockMvc.perform(post("/api/employees/{id}/skills/{skillId}/projects/{projectId}",
                        EMPLOYEE_ID, SKILL_ID, PROJECT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectCount").value(1));
    }

    // ── Unlink project ────────────────────────────────────────────────────

    @Test
    void unlinkProject_returnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/employees/{id}/skills/{skillId}/projects/{projectId}",
                        EMPLOYEE_ID, SKILL_ID, PROJECT_ID))
                .andExpect(status().isNoContent());

        verify(skillService).unlinkProject(EMPLOYEE_ID, SKILL_ID, PROJECT_ID);
    }

    // ── Browse register ───────────────────────────────────────────────────

    @Test
    void browseRegister_returnsOkWithList() throws Exception {
        when(skillService.browseRegister()).thenReturn(
                List.of(new SkillSummaryResponse(1L, "Java", 5L)));

        mockMvc.perform(get("/api/skills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Java"))
                .andExpect(jsonPath("$[0].employeeCount").value(5));
    }

    // ── Search ────────────────────────────────────────────────────────────

    @Test
    void searchBySkill_returnsOkWithResults() throws Exception {
        SkillSearchResultResponse result = new SkillSearchResultResponse(1L, "Jane Doe", "Angular", 4, 2);
        when(skillService.searchBySkill("Angular")).thenReturn(List.of(result));

        mockMvc.perform(get("/api/skills/search").param("skill", "Angular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].skillName").value("Angular"))
                .andExpect(jsonPath("$[0].employeeName").value("Jane Doe"))
                .andExpect(jsonPath("$[0].years").value(4));
    }

    @Test
    void searchBySkill_missingParam_returns400() throws Exception {
        mockMvc.perform(get("/api/skills/search"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }
}
