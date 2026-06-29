package com.psybergate.staff_engagement.bdd.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;

public class CommonSteps {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private ResponseEntity<String> response;
    private String authToken;
    private final Map<String, String> storedValues = new HashMap<>();

    @Given("the API is running")
    public void theApiIsRunning() {
        // Spring context already starts the application.
    }

    @Given("I am authenticated as {string}")
    public void authenticateAs(String email) throws Exception {
        String body = String.format("{\"email\":\"%s\",\"password\":\"password123\"}", email);
        ResponseEntity<String> loginResponse = exchangeWithoutAuth(HttpMethod.POST, "/api/auth/login", body);
        assertThat(loginResponse.getStatusCode().value()).isEqualTo(200);
        JsonNode node = objectMapper.readTree(loginResponse.getBody());
        authToken = node.get("token").asText();
        storedValues.put("token", authToken);
        storedValues.put(email + "Token", authToken);
        if (node.has("employeeId")) {
            String id = node.get("employeeId").asText();
            storeEmployeeId(email, id);
            storedValues.put("employeeId", id);
        }
    }

    public void storeEmployeeId(String email, String id) {
        storedValues.put("employee:" + email, id);
    }

    public String resolveEmployeeId(String email) {
        String key = "employee:" + email;
        if (storedValues.containsKey(key)) {
            return storedValues.get(key);
        }
        throw new IllegalStateException("No employee id available for " + email + ". Create the employee first.");
    }

    @When("I send a POST to {string} with body:")
    public void sendPostWithBody(String path, String body) {
        response = exchange(HttpMethod.POST, path, body);
    }

    @When("I send a GET to {string}")
    public void sendGet(String path) {
        response = exchange(HttpMethod.GET, path, null);
    }

    @When("I send a PUT to {string} with body:")
    public void sendPutWithBody(String path, String body) {
        response = exchange(HttpMethod.PUT, path, body);
    }

    @When("I send a PATCH to {string}")
    public void sendPatch(String path) {
        response = exchange(HttpMethod.PATCH, path, null);
    }

    @When("I send a DELETE to {string}")
    public void sendDelete(String path) {
        response = exchange(HttpMethod.DELETE, path, null);
    }

    @Then("the response status should be {int}")
    public void theResponseStatusShouldBe(int status) {
        assertThat(response.getStatusCode().value()).isEqualTo(status);
    }

    @And("the response body should contain {string} = {string}")
    public void responseBodyShouldContainField(String field, String value) throws Exception {
        JsonNode node = objectMapper.readTree(response.getBody());
        assertThat(node.has(field)).isTrue();
        assertThat(node.get(field).asText()).isEqualTo(value);
    }

    @And("the response body should contain an {string}")
    public void responseBodyShouldContainAnField(String field) throws Exception {
        JsonNode node = objectMapper.readTree(response.getBody());
        assertThat(node.has(field)).isTrue();
    }

    @And("the response body should contain {string}")
    public void responseBodyShouldContainText(String text) {
        assertThat(response.getBody()).contains(replacePlaceholders(text));
    }

    @And("the response body should not contain {string}")
    public void responseBodyShouldNotContainText(String text) {
        assertThat(response.getBody()).doesNotContain(replacePlaceholders(text));
    }

    @And("I store the response field {string} as {string}")
    public void storeResponseField(String field, String key) throws Exception {
        JsonNode node = objectMapper.readTree(response.getBody());
        storedValues.put(key, node.get(field).asText());
    }

    ResponseEntity<String> exchange(HttpMethod method, String path, String body) {
        return perform(method, path, body, authToken);
    }

    private ResponseEntity<String> exchangeWithoutAuth(HttpMethod method, String path, String body) {
        return perform(method, path, body, null);
    }

    private ResponseEntity<String> perform(HttpMethod method, String path, String body, String token) {
        MockHttpServletRequestBuilder request = request(method, replacePlaceholders(path))
                .contentType(MediaType.APPLICATION_JSON);
        if (body != null) {
            request.content(replacePlaceholders(body));
        }
        if (token != null) {
            request.header("Authorization", "Bearer " + token);
        }
        try {
            MvcResult result = mockMvc.perform(request).andReturn();
            MockHttpServletResponse servletResponse = result.getResponse();
            String responseBody = servletResponse.getContentAsString();
            return ResponseEntity.status(servletResponse.getStatus())
                    .body(responseBody.isEmpty() ? null : responseBody);
        } catch (Exception e) {
            throw new RuntimeException("MockMvc request failed: " + method + " " + path, e);
        }
    }

    String replacePlaceholders(String raw) {
        if (raw == null) {
            return null;
        }
        String result = raw;
        for (Map.Entry<String, String> entry : storedValues.entrySet()) {
            result = result.replace("${" + entry.getKey() + "}", entry.getValue());
        }
        return result;
    }

    public String getAuthToken() {
        return authToken;
    }

    public void setAuthToken(String authToken) {
        this.authToken = authToken;
    }

    public ResponseEntity<String> getResponse() {
        return response;
    }

    public void setResponse(ResponseEntity<String> response) {
        this.response = response;
    }

    public Map<String, String> getStoredValues() {
        return storedValues;
    }

    public ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}
