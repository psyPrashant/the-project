package com.psybergate.staff_engagement.bdd;

import com.psybergate.staff_engagement.IntegrationTestBase;
import io.cucumber.spring.CucumberContextConfiguration;

/**
 * Cucumber's Spring context. Inherits the {@code WebEnvironment.MOCK} +
 * {@code @AutoConfigureMockMvc} + Testcontainers Postgres setup from
 * {@link IntegrationTestBase}, so the BDD suite drives the app through MockMvc —
 * the same mechanism every other {@code *IT} uses — instead of binding a real
 * port (which is flaky on Windows loopback).
 */
@CucumberContextConfiguration
public class CucumberSpringConfig extends IntegrationTestBase {
}
