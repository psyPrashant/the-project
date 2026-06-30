package com.psybergate.staff_engagement.bdd.steps;

import com.fasterxml.jackson.databind.JsonNode;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class TaskSteps {

    @Autowired
    private CommonSteps common;

    @Given("a standalone task exists for employee {string} with title {string} created by {string}")
    public void aStandaloneTaskExistsForEmployee(String subjectEmail, String title, String creatorEmail) throws Exception {
        String subjectId = common.resolveEmployeeId(subjectEmail);

        String previousToken = common.getAuthToken();
        String previousEmployeeId = common.getStoredValues().get("employeeId");
        common.authenticateAs(creatorEmail);

        String body = String.format("{\"relatesToId\":%s,\"title\":\"%s\"}", subjectId, title);
        ResponseEntity<String> resp = common.exchange(HttpMethod.POST, "/api/tasks", body);
        common.setResponse(resp);

        assertThat(resp.getStatusCode().value()).isEqualTo(201);
        JsonNode node = common.getObjectMapper().readTree(resp.getBody());
        common.getStoredValues().put("taskId", node.get("id").asText());

        common.setAuthToken(previousToken);
        if (previousEmployeeId != null) {
            common.getStoredValues().put("employeeId", previousEmployeeId);
        } else {
            common.getStoredValues().remove("employeeId");
        }
    }
}
