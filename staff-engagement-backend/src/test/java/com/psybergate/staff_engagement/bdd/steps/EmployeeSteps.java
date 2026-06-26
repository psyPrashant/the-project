package com.psybergate.staff_engagement.bdd.steps;

import com.fasterxml.jackson.databind.JsonNode;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class EmployeeSteps {

    @Autowired
    private CommonSteps common;

    @Given("an employee exists with firstName {string}, lastName {string}, email {string}")
    public void anEmployeeExists(String firstName, String lastName, String email) throws Exception {
        String body = String.format("{\"firstName\":\"%s\",\"lastName\":\"%s\",\"email\":\"%s\"}",
                firstName, lastName, email);
        ResponseEntity<String> resp = common.exchange(HttpMethod.POST, "/api/employees", body);
        common.setResponse(resp);
        assertThat(resp.getStatusCode().value()).isEqualTo(201);
        JsonNode node = common.getObjectMapper().readTree(resp.getBody());
        common.storeEmployeeId(email, node.get("id").asText());
        common.getStoredValues().put("employeeId", node.get("id").asText());
    }

    @Given("an employee exists with email {string}")
    public void anEmployeeExistsWithEmail(String email) throws Exception {
        anEmployeeExists("Test", "User", email);
    }
}
