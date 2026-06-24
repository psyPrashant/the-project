package com.psybergate.staff_engagement;

import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base class for backend integration/smoke tests.
 *
 * <p>Boots the full Spring context against a real PostgreSQL instance running
 * inside a Testcontainers Docker container (story F2). The container is started
 * once per test class. To share a single container across classes (faster
 * suites), set {@code testcontainers.reuse.enable=true} in
 * {@code ~/.testcontainers.properties} and flip {@code withReuse(true)} on below.
 *
 * <p>Subclasses get {@link org.springframework.boot.test.web.client.TestRestTemplate}
 * autowired for API-level checks.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
public abstract class AbstractIntegrationTest {

	@Container
	static final PostgreSQLContainer<?> POSTGRES =
			new PostgreSQLContainer<>("postgres:16-alpine");

	@DynamicPropertySource
	static void postgresProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
		registry.add("spring.datasource.username", POSTGRES::getUsername);
		registry.add("spring.datasource.password", POSTGRES::getPassword);
	}
}