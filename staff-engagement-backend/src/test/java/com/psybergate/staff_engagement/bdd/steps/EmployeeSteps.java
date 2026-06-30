package com.psybergate.staff_engagement.bdd.steps;

import com.fasterxml.jackson.databind.JsonNode;
import io.cucumber.java.en.Given;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;

public class EmployeeSteps {

    // BCrypt of "password123" (cost 10) — same hash used for seeded accounts.
    private static final String DEFAULT_PASSWORD_HASH =
            "$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju";

    @Autowired
    private CommonSteps common;

    @Autowired
    private DataSource dataSource;

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

        // Backfill a known password hash so scenarios can log in as this employee.
        new JdbcTemplate(dataSource).update(
                "UPDATE employees SET password_hash = ? WHERE email = ?",
                DEFAULT_PASSWORD_HASH, email);
    }

    @Given("an employee exists with email {string}")
    public void anEmployeeExistsWithEmail(String email) throws Exception {
        anEmployeeExists("Test", "User", email);
    }
}
