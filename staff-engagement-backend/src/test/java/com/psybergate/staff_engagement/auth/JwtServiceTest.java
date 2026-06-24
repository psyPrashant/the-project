package com.psybergate.staff_engagement.auth;

import static org.assertj.core.api.Assertions.assertThat;

import com.psybergate.staff_engagement.employee.Employee;
import io.jsonwebtoken.JwtException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

	private static final String SECRET =
			"c3RhZmYtZW5nYWdlbWVudC1wb2MtZGV2LWp3dC1zZWNyZXQta2V5LW5vdC1mb3ItcHJvZHVjdGlvbi11c2U";
	private static final String ISSUER = "staff-engagement";

	private JwtService jwtService;
	private Employee employee;

	@BeforeEach
	void setUp() {
		jwtService = new JwtService(SECRET, ISSUER, 480, Clock.systemDefaultZone());
		employee = Employee.builder()
				.id(42L).email("jane@psybergate.com").firstName("Jane").lastName("Doe")
				.passwordHash("hash").build();
	}

	@Test
	void generateAndParseRoundTrip() {
		String token = jwtService.generate(employee);
		assertThat(token).isNotBlank();

		assertThat(jwtService.isValid(token)).isTrue();
		assertThat(jwtService.extractEmployeeId(token)).isEqualTo(42L);
	}

	@Test
	void tamperedTokenIsInvalid() {
		String token = jwtService.generate(employee);
		String tampered = token.substring(0, token.length() - 4) + "AAAA";
		assertThat(jwtService.isValid(tampered)).isFalse();
	}

	@Test
	void malformedTokenIsInvalid() {
		assertThat(jwtService.isValid("not-a-jwt")).isFalse();
		assertThat(jwtService.isValid("")).isFalse();
	}

	@Test
	void expiredTokenIsInvalid() {
		// Issued in the far past with a short expiry → genuinely expired relative to the system clock.
		JwtService pastService = new JwtService(SECRET, ISSUER, 60,
				Clock.fixed(Instant.parse("2020-01-01T00:00:00Z"), ZoneOffset.UTC));
		String token = pastService.generate(employee);

		assertThat(jwtService.isValid(token)).isFalse();
		assertThat(org.junit.jupiter.api.Assertions.assertThrows(JwtException.class,
				() -> jwtService.extractEmployeeId(token)))
				.as("expired token should not yield a claim").isNotNull();
	}

	@Test
	void extractEmployeeIdThrowsOnInvalid() {
		assertThat(jwtService.isValid("garbage")).isFalse();
		org.junit.jupiter.api.Assertions.assertThrows(JwtException.class,
				() -> jwtService.extractEmployeeId("garbage"));
	}
}