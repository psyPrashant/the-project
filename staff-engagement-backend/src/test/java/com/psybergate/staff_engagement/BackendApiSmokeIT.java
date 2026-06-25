package com.psybergate.staff_engagement;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

/**
 * API-level smoke integration test.
 *
 * <p>Boots the application against a real PostgreSQL via Testcontainers (see
 * {@link IntegrationTestBase}) and asserts the Actuator health endpoint
 * responds {@code 200 UP}, proving the web layer, the Spring context, and the
 * datasource all wire together end to end. Named {@code *IT} so Maven Failsafe
 * runs it on {@code mvn verify}.
 */
class BackendApiSmokeIT extends IntegrationTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthEndpointIsUp() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
