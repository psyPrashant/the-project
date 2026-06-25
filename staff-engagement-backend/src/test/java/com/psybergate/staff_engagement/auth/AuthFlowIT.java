package com.psybergate.staff_engagement.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.psybergate.staff_engagement.IntegrationTestBase;
import com.psybergate.staff_engagement.auth.dto.AuthResponse;
import com.psybergate.staff_engagement.auth.dto.LoginRequest;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeRepository;
import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/**
 * End-to-end auth flow (F6) against the real Testcontainers Postgres with seeded Employees.
 * Run by Failsafe on {@code mvn verify}.
 */
class AuthFlowIT extends IntegrationTestBase {

	@Autowired
	private TestRestTemplate restTemplate;

	@Autowired
	private EmployeeRepository employeeRepository;

	@Autowired
	private JwtService jwtService;

	@Test
	void validCredentialsReturnJwtAndEmployee() {
		ResponseEntity<AuthResponse> response = login("admin@psybergate.com", "password123");

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().token()).isNotBlank();
		assertThat(response.getBody().employeeId()).isNotNull();
		assertThat(response.getBody().email()).isEqualTo("admin@psybergate.com");
		assertThat(response.getBody().firstName()).isEqualTo("Admin");
	}

	@Test
	void invalidPasswordIsRejected() {
		ResponseEntity<String> response = loginRaw("admin@psybergate.com", "wrong-password");

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
		assertThat(response.getBody()).contains("\"status\":401");
	}

	@Test
	void unknownEmailIsRejected() {
		ResponseEntity<String> response = loginRaw("nobody@psybergate.com", "password123");

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void meReturnsCurrentEmployeeWithToken() {
		AuthResponse auth = login("admin@psybergate.com", "password123").getBody();

		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(auth.token());
		headers.setContentType(MediaType.APPLICATION_JSON);

		ResponseEntity<EmployeeResponse> response = restTemplate.exchange(
				"/api/auth/me", HttpMethod.GET, new HttpEntity<>(headers), EmployeeResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isNotNull();
		assertThat(response.getBody().email()).isEqualTo("admin@psybergate.com");
		assertThat(response.getBody().id()).isEqualTo(auth.employeeId());
	}

	@Test
	void meRefusesRequestWithoutToken() {
		ResponseEntity<String> response = restTemplate.getForEntity("/api/auth/me", String.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void meRefusesMalformedToken() {
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth("not-a-real-jwt");

		ResponseEntity<String> response = restTemplate.exchange(
				"/api/auth/me", HttpMethod.GET, new HttpEntity<>(headers), String.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void healthRemainsPublic() {
		ResponseEntity<String> response = restTemplate.getForEntity("/actuator/health", String.class);
		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
	}

	@Test
	void meReturns401WhenEmployeeNoLongerExists() {
		// A token whose subject has been deleted between issuance and the next request must be
		// treated as no longer valid (401) — not surface as a 500 from the filter (the advice does
		// not catch filter exceptions) nor a 404 from the resolver (which would leak existence).
		Employee ghost = employeeRepository.save(Employee.builder()
				.email("ghost@psybergate.com").firstName("Ghost").lastName("User")
				.passwordHash("$2a$10$hash").build());
		String token = jwtService.generate(ghost);
		employeeRepository.delete(ghost);
		employeeRepository.flush();

		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(token);
		ResponseEntity<String> response = restTemplate.exchange(
				"/api/auth/me", HttpMethod.GET, new HttpEntity<>(headers), String.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	@Test
	void seededEmployeesExist() {
		assertThat(employeeRepository.count()).isGreaterThanOrEqualTo(3);
		assertThat(employeeRepository.findByEmail("admin@psybergate.com")).isPresent();
		assertThat(employeeRepository.findByEmail("jane.doe@psybergate.com")).isPresent();
		assertThat(employeeRepository.findByEmail("john.smith@psybergate.com")).isPresent();
	}

	private ResponseEntity<AuthResponse> login(String email, String password) {
		return restTemplate.postForEntity("/api/auth/login", new LoginRequest(email, password), AuthResponse.class);
	}

	private ResponseEntity<String> loginRaw(String email, String password) {
		return restTemplate.postForEntity("/api/auth/login", new LoginRequest(email, password), String.class);
	}
}