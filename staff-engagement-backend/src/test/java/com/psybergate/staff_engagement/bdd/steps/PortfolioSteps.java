package com.psybergate.staff_engagement.bdd.steps;

import com.fasterxml.jackson.databind.JsonNode;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Portfolio-specific Cucumber steps. Generic HTTP and assertion steps (send a
 * request, check status, check a field) live in {@link CommonSteps}; this class
 * only adds the portfolio fixtures and the array-shape assertions that the
 * portfolio feature needs. State is shared through the autowired CommonSteps so
 * placeholders such as {@code ${employeeId}} resolve across step classes.
 */
public class PortfolioSteps {

    @Autowired
    private CommonSteps common;

    @Given("an authenticated user exists")
    public void anAuthenticatedUserExists() throws Exception {
        common.authenticateAs("admin@psybergate.com");
    }

    @Given("an employee exists")
    public void anEmployeeExists() throws Exception {
        String email = "bdd-" + UUID.randomUUID() + "@example.com";
        String body = String.format(
                "{\"firstName\":\"BDD\",\"lastName\":\"Test\",\"email\":\"%s\"}", email);
        ResponseEntity<String> resp = common.exchange(HttpMethod.POST, "/api/employees", body);
        common.setResponse(resp);
        assertThat(resp.getStatusCode().value()).isEqualTo(201);
        String id = readId(resp);
        common.storeEmployeeId(email, id);
        common.getStoredValues().put("employeeId", id);
    }

    @Given("the employee has an education entry")
    public void theEmployeeHasAnEducationEntry() throws Exception {
        String body = "{\"institution\":\"University of Example\",\"qualification\":\"BSc Computer Science\","
                + "\"fieldOfStudy\":\"Software Engineering\",\"startYear\":2016,\"endYear\":2020}";
        createPortfolioItem("education", body, "educationId");
    }

    @Given("the employee has a project")
    public void theEmployeeHasAProject() throws Exception {
        String body = "{\"name\":\"Staff Engagement Platform\",\"description\":\"Internal staff engagement POC\"}";
        createPortfolioItem("projects", body, "projectId");
    }

    @Given("the employee has a showcase link")
    public void theEmployeeHasAShowcaseLink() throws Exception {
        String body = "{\"label\":\"GitHub\",\"url\":\"https://github.com/example\"}";
        createPortfolioItem("links", body, "linkId");
    }

    @And("the response body should contain a {string}")
    public void responseBodyShouldContainANonEmptyArray(String field) throws Exception {
        JsonNode array = arrayField(field);
        assertThat(array.size()).isGreaterThan(0);
    }

    @And("the response body should contain an empty {string}")
    public void responseBodyShouldContainAnEmptyArray(String field) throws Exception {
        JsonNode array = arrayField(field);
        assertThat(array).isEmpty();
    }

    private void createPortfolioItem(String segment, String body, String idKey) throws Exception {
        String employeeId = common.getStoredValues().get("employeeId");
        ResponseEntity<String> resp = common.exchange(HttpMethod.POST,
                "/api/employees/" + employeeId + "/portfolio/" + segment, body);
        common.setResponse(resp);
        assertThat(resp.getStatusCode().value()).isEqualTo(201);
        common.getStoredValues().put(idKey, readId(resp));
    }

    private String readId(ResponseEntity<String> resp) throws Exception {
        return common.getObjectMapper().readTree(resp.getBody()).get("id").asText();
    }

    private JsonNode arrayField(String field) throws Exception {
        JsonNode node = common.getObjectMapper().readTree(common.getResponse().getBody());
        JsonNode array = node.get(field);
        assertThat(array).isNotNull();
        assertThat(array.isArray()).isTrue();
        return array;
    }
}
