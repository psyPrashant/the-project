package com.psybergate.staff_engagement;

import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Base class for backend integration tests (the {@code *IT} layer, run by
 * Maven Failsafe on {@code mvn verify}).
 *
 * <p>Boots the full Spring context against a real PostgreSQL 16 container
 * (story F2). {@link ServiceConnection} wires the datasource url/username/password
 * automatically — no {@code @DynamicPropertySource} needed — and the same
 * container is reusable by future {@code @DataJpaTest} repository tests.
 *
 * <p>The container is a <em>shared singleton</em>: started once in a static
 * initializer when the base class is first loaded and kept alive for the whole
 * test run, so every test context (and Spring's context cache) sees the same
 * stable JDBC URL. A per-class {@code @Container} would rotate the random port
 * between classes while the context cache holds the previous (stopped)
 * container's URL, causing connection-refused failures — so the singleton stays.
 *
 * <p>This class is abstract and its name intentionally matches neither
 * Surefire's {@code *Test} pattern nor Failsafe's {@code *IT} pattern, so no
 * test runner tries to execute it — only concrete {@code *IT} subclasses run.
 *
 * <p>For fast local repeat runs, set {@code testcontainers.reuse.enable=true} in
 * {@code ~/.testcontainers.properties} and flip {@code withReuse(true)} on below.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public abstract class IntegrationTestBase {

	@ServiceConnection
	static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

	static {
		POSTGRES.start();
	}
}