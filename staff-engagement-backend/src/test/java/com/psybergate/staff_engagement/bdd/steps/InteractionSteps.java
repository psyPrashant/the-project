package com.psybergate.staff_engagement.bdd.steps;

import com.fasterxml.jackson.databind.JsonNode;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class InteractionSteps {

    @Autowired
    private CommonSteps common;

    @Given("an interaction exists for subject {string} created by {string} with note {string} and type {string} and date {string}")
    public void anInteractionExists(String subjectEmail, String creatorEmail, String note, String type, String date) throws Exception {
        String subjectId = common.resolveEmployeeId(subjectEmail);

        String previousToken = common.getAuthToken();
        common.authenticateAs(creatorEmail);

        String body = String.format("{\"subjectId\":%s,\"note\":\"%s\",\"type\":\"%s\",\"date\":\"%s\"}",
                subjectId, note, type, date);

        ResponseEntity<String> resp = common.exchange(HttpMethod.POST, "/api/interactions", body);
        common.setResponse(resp);

        assertThat(resp.getStatusCode().value()).isEqualTo(201);
        JsonNode node = common.getObjectMapper().readTree(resp.getBody());
        common.getStoredValues().put("interactionId", node.get("id").asText());
        common.getStoredValues().put("subjectId", subjectId);

        common.setAuthToken(previousToken);
    }
}
