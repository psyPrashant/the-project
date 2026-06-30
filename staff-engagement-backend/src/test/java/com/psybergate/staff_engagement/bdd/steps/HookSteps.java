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
        jdbc.update("DELETE FROM tasks");
        jdbc.update("DELETE FROM interactions");
        jdbc.update("DELETE FROM portfolio_education");
        jdbc.update("DELETE FROM portfolio_projects");
        jdbc.update("DELETE FROM portfolio_links");
        jdbc.update("DELETE FROM employees WHERE email NOT IN ('admin@psybergate.com', 'jane.doe@psybergate.com', 'john.smith@psybergate.com')");
    }
}
