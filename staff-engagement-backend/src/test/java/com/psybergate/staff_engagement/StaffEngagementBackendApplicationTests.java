package com.psybergate.staff_engagement;

import org.junit.jupiter.api.Test;

/**
 * Context-loads smoke test (story F2).
 *
 * <p>Boots the full Spring context against a real PostgreSQL via Testcontainers
 * (see {@link AbstractIntegrationTest}) and verifies the context starts cleanly.
 */
class StaffEngagementBackendApplicationTests extends AbstractIntegrationTest {

	@Test
	void contextLoads() {
	}

}