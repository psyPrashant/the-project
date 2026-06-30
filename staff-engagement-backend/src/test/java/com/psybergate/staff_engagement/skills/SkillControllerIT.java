package com.psybergate.staff_engagement.skills;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.psybergate.staff_engagement.IntegrationTestBase;
import com.psybergate.staff_engagement.auth.dto.AuthResponse;
import com.psybergate.staff_engagement.auth.dto.LoginRequest;
import com.psybergate.staff_engagement.employee.dto.CreateEmployeeRequest;
import com.psybergate.staff_engagement.employee.dto.EmployeeProfileResponse;
import com.psybergate.staff_engagement.skills.dto.AddEmployeeSkillRequest;
import com.psybergate.staff_engagement.skills.dto.EmployeeSkillResponse;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

class SkillControllerIT extends IntegrationTestBase {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void authenticate() throws Exception {
        String body = objectMapper.writeValueAsString(new LoginRequest("admin@psybergate.com", "password123"));
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();
        token = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class).token();
    }

    private EmployeeProfileResponse createEmployee() throws Exception {
        String body = objectMapper.writeValueAsString(
                new CreateEmployeeRequest("Skill", "Test-" + UUID.randomUUID(), uniqueEmail(), null, null, null));
        MvcResult result = mockMvc.perform(post("/api/employees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), EmployeeProfileResponse.class);
    }

    private EmployeeSkillResponse addSkill(Long employeeId, String skillName, int years) throws Exception {
        String body = objectMapper.writeValueAsString(new AddEmployeeSkillRequest(skillName, years));
        MvcResult result = mockMvc.perform(post("/api/employees/" + employeeId + "/skills")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), EmployeeSkillResponse.class);
    }

    private String uniqueEmail() {
        return "skill-" + UUID.randomUUID() + "@example.com";
    }

    // ── Add skill ─────────────────────────────────────────────────────────

    @Test
    void addSkill_validRequest_returns201() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        EmployeeSkillResponse skill = addSkill(emp.id(), "Angular", 4);
        assertThat(skill.skillName()).isEqualTo("Angular");
        assertThat(skill.years()).isEqualTo(4);
        assertThat(skill.projectCount()).isZero();
    }

    @Test
    void addSkill_negativeYears_returns400() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        String body = "{\"skillName\":\"Java\",\"years\":-1}";
        mockMvc.perform(post("/api/employees/" + emp.id() + "/skills")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addSkill_missingYears_returns400() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        String body = "{\"skillName\":\"Java\"}";
        mockMvc.perform(post("/api/employees/" + emp.id() + "/skills")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addSkill_duplicate_returns409() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        addSkill(emp.id(), "TypeScript", 3);
        String body = "{\"skillName\":\"TypeScript\",\"years\":2}";
        mockMvc.perform(post("/api/employees/" + emp.id() + "/skills")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void addSkill_caseInsensitiveDuplicate_returns409() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        addSkill(emp.id(), "Java", 5);
        String body = "{\"skillName\":\"java\",\"years\":2}";
        mockMvc.perform(post("/api/employees/" + emp.id() + "/skills")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void addSkill_unknownEmployee_returns404() throws Exception {
        String body = "{\"skillName\":\"Go\",\"years\":1}";
        mockMvc.perform(post("/api/employees/999999999/skills")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    // ── Update skill ──────────────────────────────────────────────────────

    @Test
    void updateSkill_validRequest_returns200() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        EmployeeSkillResponse skill = addSkill(emp.id(), "Docker", 2);
        String body = "{\"years\":5}";
        MvcResult result = mockMvc.perform(put("/api/employees/" + emp.id() + "/skills/" + skill.id())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();
        EmployeeSkillResponse updated = objectMapper.readValue(result.getResponse().getContentAsString(), EmployeeSkillResponse.class);
        assertThat(updated.years()).isEqualTo(5);
    }

    @Test
    void updateSkill_unknownEntry_returns404() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        String body = "{\"years\":3}";
        mockMvc.perform(put("/api/employees/" + emp.id() + "/skills/999999999")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    // ── Delete skill ──────────────────────────────────────────────────────

    @Test
    void deleteSkill_existing_returns204() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        EmployeeSkillResponse skill = addSkill(emp.id(), "SQL", 6);
        mockMvc.perform(delete("/api/employees/" + emp.id() + "/skills/" + skill.id())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteSkill_unknownEntry_returns404() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        mockMvc.perform(delete("/api/employees/" + emp.id() + "/skills/999999999")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    // ── List skills ───────────────────────────────────────────────────────

    @Test
    void getSkills_noSkills_returnsEmptyArray() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        MvcResult result = mockMvc.perform(get("/api/employees/" + emp.id() + "/skills")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(body.isArray()).isTrue();
        assertThat(body).isEmpty();
    }

    @Test
    void getSkills_unknownEmployee_returns404() throws Exception {
        mockMvc.perform(get("/api/employees/999999999/skills")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    // ── Browse register ───────────────────────────────────────────────────

    @Test
    void browseRegister_returnsOk() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        addSkill(emp.id(), "Spring Boot", 3);
        MvcResult result = mockMvc.perform(get("/api/skills")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        String responseBody = result.getResponse().getContentAsString();
        assertThat(responseBody).contains("Spring Boot");
    }

    // ── Ranked search ─────────────────────────────────────────────────────

    @Test
    void searchBySkill_matchingEmployee_returns200() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        addSkill(emp.id(), "Kotlin", 4);
        MvcResult result = mockMvc.perform(get("/api/skills/search?skill=Kotlin")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        String responseBody = result.getResponse().getContentAsString();
        assertThat(responseBody).contains("Kotlin");
    }

    @Test
    void searchBySkill_noMatches_returnsEmptyArray() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/skills/search?skill=COBOL")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(body.isArray()).isTrue();
        assertThat(body).isEmpty();
    }

    @Test
    void searchBySkill_missingParam_returns400() throws Exception {
        mockMvc.perform(get("/api/skills/search")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    // ── Portfolio skills integration ───────────────────────────────────────

    @Test
    void getPortfolio_noSkills_skillsFieldIsEmptyArray() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        MvcResult result = mockMvc.perform(get("/api/employees/" + emp.id() + "/portfolio")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(body.get("skills").isArray()).isTrue();
        assertThat(body.get("skills")).isEmpty();
    }

    @Test
    void getPortfolio_includesSkillsSection() throws Exception {
        EmployeeProfileResponse emp = createEmployee();
        addSkill(emp.id(), "React", 3);
        MvcResult result = mockMvc.perform(get("/api/employees/" + emp.id() + "/portfolio")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        JsonNode skills = body.get("skills");
        assertThat(skills.isArray()).isTrue();
        assertThat(skills).hasSize(1);
        assertThat(skills.get(0).get("skillName").asText()).isEqualTo("React");
    }

}
