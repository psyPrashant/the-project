package com.psybergate.staff_engagement.employee;

import static org.assertj.core.api.Assertions.assertThat;

import com.psybergate.staff_engagement.IntegrationTestBase;
import com.psybergate.staff_engagement.auth.dto.AuthResponse;
import com.psybergate.staff_engagement.auth.dto.LoginRequest;
import com.psybergate.staff_engagement.employee.dto.CreateEmployeeRequest;
import com.psybergate.staff_engagement.employee.dto.EmployeeProfileResponse;
import com.psybergate.staff_engagement.employee.dto.UpdateEmployeeRequest;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

class EmployeeCrudIT extends IntegrationTestBase {

	@Autowired
	private TestRestTemplate restTemplate;

	private String token;

	@BeforeEach
	void authenticate() {
		token = restTemplate.postForEntity("/api/auth/login",
				new LoginRequest("admin@psybergate.com", "password123"),
				AuthResponse.class).getBody().token();
	}

	private HttpHeaders authHeaders() {
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(token);
		headers.setContentType(MediaType.APPLICATION_JSON);
		return headers;
	}

	private String uniqueEmail() {
		return "test-" + UUID.randomUUID() + "@example.com";
	}

	private EmployeeProfileResponse createEmployee(String firstName, String lastName, String email) {
		return restTemplate.exchange("/api/employees", HttpMethod.POST,
				new HttpEntity<>(new CreateEmployeeRequest(firstName, lastName, email, null, null, null), authHeaders()),
				EmployeeProfileResponse.class).getBody();
	}

	// POST /api/employees

	@Test
	void create_validRequest_returns201WithProfile() {
		CreateEmployeeRequest request = new CreateEmployeeRequest(
				"Test", "User", uniqueEmail(), "Dev", "Engineering", "555-0100");

		ResponseEntity<EmployeeProfileResponse> response = restTemplate.exchange(
				"/api/employees", HttpMethod.POST,
				new HttpEntity<>(request, authHeaders()), EmployeeProfileResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
		assertThat(response.getBody().id()).isNotNull();
		assertThat(response.getBody().firstName()).isEqualTo("Test");
		assertThat(response.getBody().jobTitle()).isEqualTo("Dev");
		assertThat(response.getBody().archived()).isFalse();
	}

	@Test
	void create_missingFirstName_returns400() {
		ResponseEntity<String> response = restTemplate.exchange("/api/employees", HttpMethod.POST,
				new HttpEntity<>(new CreateEmployeeRequest("", "User", uniqueEmail(), null, null, null), authHeaders()),
				String.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
	}

	@Test
	void create_duplicateEmail_returns409() {
		String email = uniqueEmail();
		createEmployee("A", "B", email);

		ResponseEntity<String> response = restTemplate.exchange("/api/employees", HttpMethod.POST,
				new HttpEntity<>(new CreateEmployeeRequest("A", "B", email, null, null, null), authHeaders()),
				String.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
	}

	@Test
	void create_unauthenticated_returns401() {
		ResponseEntity<String> response = restTemplate.postForEntity("/api/employees",
				new CreateEmployeeRequest("A", "B", uniqueEmail(), null, null, null), String.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
	}

	// GET /api/employees/{id}

	@Test
	void getProfile_existingEmployee_returns200() {
		String email = uniqueEmail();
		EmployeeProfileResponse created = createEmployee("Get", "Me", email);

		ResponseEntity<EmployeeProfileResponse> response = restTemplate.exchange(
				"/api/employees/" + created.id(), HttpMethod.GET,
				new HttpEntity<>(authHeaders()), EmployeeProfileResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody().email()).isEqualTo(email);
	}

	@Test
	void getProfile_unknownId_returns404() {
		ResponseEntity<String> response = restTemplate.exchange(
				"/api/employees/999999999", HttpMethod.GET,
				new HttpEntity<>(authHeaders()), String.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
	}

	// GET /api/employees (list & search)

	@Test
	void list_includesCreatedEmployee() {
		String email = uniqueEmail();
		createEmployee("Listed", "User", email);

		ResponseEntity<List<EmployeeProfileResponse>> response = restTemplate.exchange(
				"/api/employees", HttpMethod.GET,
				new HttpEntity<>(authHeaders()),
				new ParameterizedTypeReference<>() {});

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).extracting(EmployeeProfileResponse::email).contains(email);
	}

	@Test
	void search_byName_returnsMatchingEmployee() {
		String uniqueFirst = "Zyx" + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
		String email = uniqueEmail();
		createEmployee(uniqueFirst, "SearchTest", email);

		ResponseEntity<List<EmployeeProfileResponse>> response = restTemplate.exchange(
				"/api/employees?search=" + uniqueFirst, HttpMethod.GET,
				new HttpEntity<>(authHeaders()),
				new ParameterizedTypeReference<>() {});

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).extracting(EmployeeProfileResponse::email).contains(email);
	}

	@Test
	void search_noMatches_returnsEmptyArray() {
		ResponseEntity<List<EmployeeProfileResponse>> response = restTemplate.exchange(
				"/api/employees?search=ZzZzZzZzZzZzNomatch99x", HttpMethod.GET,
				new HttpEntity<>(authHeaders()),
				new ParameterizedTypeReference<>() {});

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody()).isEmpty();
	}

	// PUT /api/employees/{id}

	@Test
	void update_validRequest_returns200WithUpdatedProfile() {
		EmployeeProfileResponse created = createEmployee("Old", "Name", uniqueEmail());

		UpdateEmployeeRequest updateReq = new UpdateEmployeeRequest(
				"New", "Name", uniqueEmail(), "Manager", null, null);
		ResponseEntity<EmployeeProfileResponse> response = restTemplate.exchange(
				"/api/employees/" + created.id(), HttpMethod.PUT,
				new HttpEntity<>(updateReq, authHeaders()), EmployeeProfileResponse.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(response.getBody().firstName()).isEqualTo("New");
		assertThat(response.getBody().jobTitle()).isEqualTo("Manager");
	}

	@Test
	void update_blankLastName_returns400() {
		EmployeeProfileResponse created = createEmployee("Valid", "Name", uniqueEmail());

		ResponseEntity<String> response = restTemplate.exchange(
				"/api/employees/" + created.id(), HttpMethod.PUT,
				new HttpEntity<>(new UpdateEmployeeRequest("Valid", "", uniqueEmail(), null, null, null), authHeaders()),
				String.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
	}

	@Test
	void update_unknownEmployee_returns404() {
		ResponseEntity<String> response = restTemplate.exchange(
				"/api/employees/999999999", HttpMethod.PUT,
				new HttpEntity<>(new UpdateEmployeeRequest("A", "B", uniqueEmail(), null, null, null), authHeaders()),
				String.class);

		assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
	}

	// PATCH /api/employees/{id}/archive

	@Test
	void archive_returns204AndEmployeeAbsentFromList() {
		String email = uniqueEmail();
		EmployeeProfileResponse created = createEmployee("Archive", "Me", email);

		ResponseEntity<Void> archiveResponse = restTemplate.exchange(
				"/api/employees/" + created.id() + "/archive", HttpMethod.PATCH,
				new HttpEntity<>(authHeaders()), Void.class);

		assertThat(archiveResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

		List<EmployeeProfileResponse> list = restTemplate.exchange(
				"/api/employees", HttpMethod.GET,
				new HttpEntity<>(authHeaders()),
				new ParameterizedTypeReference<List<EmployeeProfileResponse>>() {}).getBody();
		assertThat(list).extracting(EmployeeProfileResponse::email).doesNotContain(email);
	}

	@Test
	void archive_profileStillAccessibleByIdWithArchivedTrue() {
		EmployeeProfileResponse created = createEmployee("Archived", "Profile", uniqueEmail());
		restTemplate.exchange("/api/employees/" + created.id() + "/archive", HttpMethod.PATCH,
				new HttpEntity<>(authHeaders()), Void.class);

		ResponseEntity<EmployeeProfileResponse> profile = restTemplate.exchange(
				"/api/employees/" + created.id(), HttpMethod.GET,
				new HttpEntity<>(authHeaders()), EmployeeProfileResponse.class);

		assertThat(profile.getStatusCode()).isEqualTo(HttpStatus.OK);
		assertThat(profile.getBody().archived()).isTrue();
	}
}
