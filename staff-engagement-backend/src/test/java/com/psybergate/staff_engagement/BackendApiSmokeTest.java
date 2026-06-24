package com.psybergate.staff_engagement;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * API-level smoke test (story F2).
 *
 * <p>Boots the application against a real PostgreSQL via Testcontainers (see
 * {@link AbstractIntegrationTest}) and asserts the Actuator health endpoint
 * responds {@code 200 UP}, proving the web layer, the Spring context, and the
 * datasource all wire together end to end.
 */
class BackendApiSmokeTest extends AbstractIntegrationTest {

	@Autowired
	private TestRestTemplate restTemplate;

	@Test
	void healthEndpointIsUp() {
		ResponseEntity<String> response = restTemplate.getForEntity("/actuator/health", String.class);

		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertNotNull(response.getBody());
		assertTrue(response.getBody().contains("\"status\":\"UP\""),
				"Health body should report UP, was: " + response.getBody());
	}
}