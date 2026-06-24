package com.psybergate.staff_engagement;

import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Base class for backend integration/smoke tests.
 *
 * <p>Boots the full Spring context against a real PostgreSQL instance running
 * inside a Testcontainers Docker container (story F2).
 *
 * <p>The container is a <em>shared singleton</em>: started once in a static
 * initializer when the base class is first loaded and kept alive for the whole
 * test run. This is the pattern recommended by the Spring Boot + Testcontainers
 * docs, because it gives every test context the same, stable JDBC URL. With a
 * per-class {@code @Container} the random port changes between classes while
 * Spring's test context cache can hold on to the previous (now-stopped)
 * container's URL, causing connection-refused failures.
 *
 * <p>To share the container across separate JVM runs as well, set
 * {@code testcontainers.reuse.enable=true} in {@code ~/.testcontainers.properties}
 * and flip {@code withReuse(true)} on below.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public abstract class AbstractIntegrationTest {

	private static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

	static {
		POSTGRES.start();
	}

	@DynamicPropertySource
	static void postgresProperties(DynamicPropertyRegistry registry) {
		registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
		registry.add("spring.datasource.username", POSTGRES::getUsername);
		registry.add("spring.datasource.password", POSTGRES::getPassword);
	}
}