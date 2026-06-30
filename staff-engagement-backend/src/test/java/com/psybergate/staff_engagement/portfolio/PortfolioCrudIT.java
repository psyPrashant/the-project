package com.psybergate.staff_engagement.portfolio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.psybergate.staff_engagement.IntegrationTestBase;
import com.psybergate.staff_engagement.auth.dto.AuthResponse;
import com.psybergate.staff_engagement.auth.dto.LoginRequest;
import com.psybergate.staff_engagement.employee.dto.CreateEmployeeRequest;
import com.psybergate.staff_engagement.employee.dto.EmployeeProfileResponse;
import com.psybergate.staff_engagement.portfolio.dto.CreateEducationRequest;
import com.psybergate.staff_engagement.portfolio.dto.CreateProjectRequest;
import com.psybergate.staff_engagement.portfolio.dto.CreateShowcaseLinkRequest;
import com.psybergate.staff_engagement.portfolio.dto.EducationResponse;
import com.psybergate.staff_engagement.portfolio.dto.PortfolioResponse;
import com.psybergate.staff_engagement.portfolio.dto.ProjectResponse;
import com.psybergate.staff_engagement.portfolio.dto.ShowcaseLinkResponse;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

class PortfolioCrudIT extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
                new CreateEmployeeRequest("Portfolio", "Test", uniqueEmail(), null, null, null));
        MvcResult result = mockMvc.perform(post("/api/employees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), EmployeeProfileResponse.class);
    }

    private String uniqueEmail() {
        return "portfolio-" + UUID.randomUUID() + "@example.com";
    }

    private EducationResponse addEducation(Long employeeId) throws Exception {
        String body = objectMapper.writeValueAsString(
                new CreateEducationRequest("University of Example", "BSc Computer Science", "Software Engineering", 2016, 2020, null));
        MvcResult result = mockMvc.perform(post(basePath(employeeId) + "/education")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), EducationResponse.class);
    }

    private ProjectResponse addProject(Long employeeId) throws Exception {
        String body = objectMapper.writeValueAsString(
                new CreateProjectRequest("Staff Engagement", "Internal POC", null, null, null));
        MvcResult result = mockMvc.perform(post(basePath(employeeId) + "/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), ProjectResponse.class);
    }

    private ShowcaseLinkResponse addLink(Long employeeId) throws Exception {
        String body = objectMapper.writeValueAsString(
                new CreateShowcaseLinkRequest("GitHub", "https://github.com/example", 1));
        MvcResult result = mockMvc.perform(post(basePath(employeeId) + "/links")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), ShowcaseLinkResponse.class);
    }

    private String basePath(Long employeeId) {
        return "/api/employees/" + employeeId + "/portfolio";
    }

    @Test
    void getPortfolio_unknownEmployee_returns404() throws Exception {
        mockMvc.perform(get("/api/employees/999999999/portfolio")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    @Test
    void getPortfolio_emptyPortfolio_returnsEmptyLists() throws Exception {
        EmployeeProfileResponse employee = createEmployee();

        MvcResult result = mockMvc.perform(get(basePath(employee.id()))
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        PortfolioResponse portfolio = objectMapper.readValue(result.getResponse().getContentAsString(), PortfolioResponse.class);
        assertThat(portfolio.employeeId()).isEqualTo(employee.id());
        assertThat(portfolio.education()).isEmpty();
        assertThat(portfolio.projects()).isEmpty();
        assertThat(portfolio.links()).isEmpty();
        assertThat(portfolio.skills()).isEmpty();
    }

    @Test
    void getPortfolio_withData_returnsAllSections() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        addEducation(employee.id());
        addProject(employee.id());
        addLink(employee.id());

        MvcResult result = mockMvc.perform(get(basePath(employee.id()))
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        PortfolioResponse portfolio = objectMapper.readValue(result.getResponse().getContentAsString(), PortfolioResponse.class);
        assertThat(portfolio.education()).hasSize(1);
        assertThat(portfolio.projects()).hasSize(1);
        assertThat(portfolio.links()).hasSize(1);
        assertThat(portfolio.skills()).isNotNull();
    }

    // Education tests

    @Test
    void addEducation_validRequest_returns201() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        EducationResponse education = addEducation(employee.id());
        assertThat(education.institution()).isEqualTo("University of Example");
    }

    @Test
    void addEducation_missingInstitution_returns400() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        String body = objectMapper.writeValueAsString(
                new CreateEducationRequest("", "BSc", null, null, null, null));

        mockMvc.perform(post(basePath(employee.id()) + "/education")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateEducation_validRequest_returns200() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        EducationResponse education = addEducation(employee.id());

        String body = objectMapper.writeValueAsString(
                new CreateEducationRequest("Updated University", "MSc", null, null, null, null));

        MvcResult result = mockMvc.perform(put(basePath(employee.id()) + "/education/" + education.id())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        EducationResponse updated = objectMapper.readValue(result.getResponse().getContentAsString(), EducationResponse.class);
        assertThat(updated.institution()).isEqualTo("Updated University");
    }

    @Test
    void deleteEducation_existing_returns204() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        EducationResponse education = addEducation(employee.id());

        mockMvc.perform(delete(basePath(employee.id()) + "/education/" + education.id())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    // Project tests

    @Test
    void addProject_validRequest_returns201() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        ProjectResponse project = addProject(employee.id());
        assertThat(project.name()).isEqualTo("Staff Engagement");
    }

    @Test
    void addProject_missingName_returns400() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        String body = objectMapper.writeValueAsString(
                new CreateProjectRequest("", "desc", null, null, null));

        mockMvc.perform(post(basePath(employee.id()) + "/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateProject_validRequest_returns200() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        ProjectResponse project = addProject(employee.id());

        String body = objectMapper.writeValueAsString(
                new CreateProjectRequest("Updated Project", "Updated desc", null, null, null));

        MvcResult result = mockMvc.perform(put(basePath(employee.id()) + "/projects/" + project.id())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        ProjectResponse updated = objectMapper.readValue(result.getResponse().getContentAsString(), ProjectResponse.class);
        assertThat(updated.name()).isEqualTo("Updated Project");
    }

    @Test
    void deleteProject_existing_returns204() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        ProjectResponse project = addProject(employee.id());

        mockMvc.perform(delete(basePath(employee.id()) + "/projects/" + project.id())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    // Showcase link tests

    @Test
    void addLink_validUrl_returns201() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        ShowcaseLinkResponse link = addLink(employee.id());
        assertThat(link.label()).isEqualTo("GitHub");
    }

    @Test
    void addLink_invalidUrl_returns400() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        String body = objectMapper.writeValueAsString(
                new CreateShowcaseLinkRequest("Bad", "not-a-url", null));

        mockMvc.perform(post(basePath(employee.id()) + "/links")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateLink_validRequest_returns200() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        ShowcaseLinkResponse link = addLink(employee.id());

        String body = objectMapper.writeValueAsString(
                new CreateShowcaseLinkRequest("Updated", "https://updated.com", 2));

        MvcResult result = mockMvc.perform(put(basePath(employee.id()) + "/links/" + link.id())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        ShowcaseLinkResponse updated = objectMapper.readValue(result.getResponse().getContentAsString(), ShowcaseLinkResponse.class);
        assertThat(updated.label()).isEqualTo("Updated");
    }

    @Test
    void deleteLink_existing_returns204() throws Exception {
        EmployeeProfileResponse employee = createEmployee();
        ShowcaseLinkResponse link = addLink(employee.id());

        mockMvc.perform(delete(basePath(employee.id()) + "/links/" + link.id())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }
}
