package com.psybergate.staff_engagement.bdd.steps;

import io.cucumber.java.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

public class HookSteps {

    @Autowired
    private DataSource dataSource;

    @Before
    public void cleanTestData() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        // Skills tables: Hibernate-generated FK from employee_skill_project → employee_skill
        // does NOT carry ON DELETE CASCADE, so the junction table must be cleared first.
        // Canonical skill rows are kept; only employee-skill links are reset.
        jdbc.update("DELETE FROM employee_skill_project");
        jdbc.update("DELETE FROM employee_skill");
        jdbc.update("DELETE FROM tasks");
        jdbc.update("DELETE FROM interactions");
        jdbc.update("DELETE FROM portfolio_education");
        jdbc.update("DELETE FROM portfolio_projects");
        jdbc.update("DELETE FROM portfolio_links");
        jdbc.update("DELETE FROM employees WHERE email NOT IN ('admin@psybergate.com', 'jane.doe@psybergate.com', 'john.smith@psybergate.com')");
    }
}
