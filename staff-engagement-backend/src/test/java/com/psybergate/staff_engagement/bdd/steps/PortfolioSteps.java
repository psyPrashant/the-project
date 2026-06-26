package com.psybergate.staff_engagement.bdd.steps;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import com.fasterxml.jackson.databind.JsonNode;
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
import com.psybergate.staff_engagement.portfolio.dto.ProjectResponse;
import com.psybergate.staff_engagement.portfolio.dto.ShowcaseLinkResponse;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.cucumber.spring.CucumberContextConfiguration;
import io.cucumber.spring.ScenarioScope;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@CucumberContextConfiguration
@ScenarioScope
@RequiredArgsConstructor
public class PortfolioSteps extends IntegrationTestBase {

    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;

    private String token;
    private Long employeeId;
    private Long educationId;
    private Long projectId;
    private Long linkId;
    private MvcResult lastResult;
    private String lastResponseBody;

    @Before
    public void reset() {
        token = null;
        employeeId = null;
        educationId = null;
        projectId = null;
        linkId = null;
        lastResult = null;
        lastResponseBody = null;
    }

    @Given("the API is running")
    public void theApiIsRunning() {
        // Spring context is loaded by the integration-test base; nothing to do here.
    }

    @Given("an authenticated user exists")
    public void anAuthenticatedUserExists() throws Exception {
        String body = objectMapper.writeValueAsString(new LoginRequest("admin@psybergate.com", "password123"));
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andReturn();
        token = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class).token();
    }

    @Given("an employee exists")
    public void anEmployeeExists() throws Exception {
        ensureAuthenticated();
        String email = "bdd-" + UUID.randomUUID() + "@example.com";
        String body = objectMapper.writeValueAsString(
                new CreateEmployeeRequest("BDD", "Test", email, null, null, null));
        MvcResult result = mockMvc.perform(post("/api/employees")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andReturn();
        employeeId = objectMapper.readValue(result.getResponse().getContentAsString(), EmployeeProfileResponse.class).id();
    }

    @Given("the employee has an education entry")
    public void theEmployeeHasAnEducationEntry() throws Exception {
        ensureEmployee();
        String body = objectMapper.writeValueAsString(
                new CreateEducationRequest("University of Example", "BSc Computer Science", "Software Engineering", 2016, 2020, null));
        MvcResult result = mockMvc.perform(post("/api/employees/" + employeeId + "/portfolio/education")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andReturn();
        educationId = objectMapper.readValue(result.getResponse().getContentAsString(), EducationResponse.class).id();
    }

    @Given("the employee has a project")
    public void theEmployeeHasAProject() throws Exception {
        ensureEmployee();
        String body = objectMapper.writeValueAsString(
                new CreateProjectRequest("Staff Engagement Platform", "Internal staff engagement POC", null, null, null));
        MvcResult result = mockMvc.perform(post("/api/employees/" + employeeId + "/portfolio/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andReturn();
        projectId = objectMapper.readValue(result.getResponse().getContentAsString(), ProjectResponse.class).id();
    }

    @Given("the employee has a showcase link")
    public void theEmployeeHasAShowcaseLink() throws Exception {
        ensureEmployee();
        String body = objectMapper.writeValueAsString(
                new CreateShowcaseLinkRequest("GitHub", "https://github.com/example", 1));
        MvcResult result = mockMvc.perform(post("/api/employees/" + employeeId + "/portfolio/links")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andReturn();
        linkId = objectMapper.readValue(result.getResponse().getContentAsString(), ShowcaseLinkResponse.class).id();
    }

    @When("I send a POST to {string} with body:")
    public void iSendAPostToWithBody(String path, String body) throws Exception {
        ensureAuthenticated();
        executeRequest(post(resolvePath(path)).content(body));
    }

    @When("I send a GET to {string}")
    public void iSendAGetTo(String path) throws Exception {
        ensureAuthenticated();
        executeRequest(get(resolvePath(path)));
    }

    @When("I send a PUT to {string} with body:")
    public void iSendAPutToWithBody(String path, String body) throws Exception {
        ensureAuthenticated();
        executeRequest(put(resolvePath(path)).content(body));
    }

    @When("I send a DELETE to {string}")
    public void iSendADeleteTo(String path) throws Exception {
        ensureAuthenticated();
        executeRequest(delete(resolvePath(path)));
    }

    private void executeRequest(MockHttpServletRequestBuilder builder) throws Exception {
        lastResult = mockMvc.perform(builder
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andReturn();
        lastResponseBody = lastResult.getResponse().getContentAsString();
    }

    private void ensureAuthenticated() throws Exception {
        if (token == null) {
            anAuthenticatedUserExists();
        }
    }

    private void ensureEmployee() throws Exception {
        ensureAuthenticated();
        if (employeeId == null) {
            anEmployeeExists();
        }
    }

    private String resolvePath(String path) {
        return path.replace("{employeeId}", String.valueOf(employeeId))
                .replace("{educationId}", String.valueOf(educationId))
                .replace("{projectId}", String.valueOf(projectId))
                .replace("{linkId}", String.valueOf(linkId));
    }

    @Then("the response status should be {int}")
    public void theResponseStatusShouldBe(int status) {
        assertThat(lastResult.getResponse().getStatus()).isEqualTo(status);
    }

    @Then("the response body should contain {string} = {string}")
    public void theResponseBodyShouldContainFieldEquals(String field, String value) throws Exception {
        JsonNode node = objectMapper.readTree(lastResponseBody);
        assertThat(node.get(field).asText()).isEqualTo(value);
    }

    @Then("^the response body should contain an? \"([^\"]*)\"$")
    public void theResponseBodyShouldContainAn(String field) throws Exception {
        JsonNode node = objectMapper.readTree(lastResponseBody);
        JsonNode array = node.get(field);
        assertThat(array).isNotNull();
        assertThat(array.isArray()).isTrue();
        assertThat(array.size()).isGreaterThan(0);
    }

    @Then("^the response body should contain an? empty \"([^\"]*)\"$")
    public void theResponseBodyShouldContainAEmpty(String field) throws Exception {
        JsonNode node = objectMapper.readTree(lastResponseBody);
        JsonNode array = node.get(field);
        assertThat(array).isNotNull();
        assertThat(array.isArray()).isTrue();
        assertThat(array).isEmpty();
    }
}
