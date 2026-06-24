package com.psybergate.staff_engagement;

import org.junit.jupiter.api.Test;

/**
 * Context-loads integration test (story F2).
 *
 * <p>Boots the full Spring context against a real PostgreSQL via Testcontainers
 * (see {@link IntegrationTestBase}) and verifies the context starts cleanly.
 * Named {@code *IT} so Maven Failsafe runs it on {@code mvn verify}.
 */
class StaffEngagementBackendApplicationIT extends IntegrationTestBase {

	@Test
	void contextLoads() {
	}

}