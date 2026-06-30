package com.psybergate.staff_engagement.bdd.steps;

import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Cucumber step definitions for the Skills Register feature.
 * Generic HTTP and assertion steps live in {@link CommonSteps}; this class
 * only adds skills-specific fixture setup. State flows through {@link CommonSteps}
 * so placeholders like {@code ${employeeId}} and {@code ${skillId}} resolve
 * across step classes.
 */
public class SkillsSteps {

    @Autowired
    private CommonSteps common;

    @Given("the employee has the skill {string} with {int} years")
    public void theEmployeeHasTheSkill(String skillName, int years) {
        String employeeId = common.getStoredValues().get("employeeId");
        String body = String.format("{\"skillName\":\"%s\",\"years\":%d}", skillName, years);
        ResponseEntity<String> resp = common.exchange(
                HttpMethod.POST, "/api/employees/" + employeeId + "/skills", body);
        common.setResponse(resp);
        assertThat(resp.getStatusCode().value()).isEqualTo(201);
        try {
            String id = common.getObjectMapper().readTree(resp.getBody()).get("id").asText();
            common.getStoredValues().put("skillId", id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse skill response", e);
        }
    }
}
