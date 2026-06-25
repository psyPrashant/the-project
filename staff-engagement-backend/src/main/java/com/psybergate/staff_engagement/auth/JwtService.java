package com.psybergate.staff_engagement.auth;

import com.psybergate.staff_engagement.employee.Employee;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Issues and validates HS256 JWTs. Subject is the Employee id; {@code email} is a claim.
 * An injectable {@link Clock} makes the expired-token negative path cheap to test.
 */
@Service
public class JwtService {

	private final SecretKey key;
	private final String issuer;
	private final Duration expiry;
	private final Clock clock;

	public JwtService(@Value("${app.jwt.secret}") String secretBase64,
			@Value("${app.jwt.issuer}") String issuer,
			@Value("${app.jwt.expiry-minutes:480}") long expiryMinutes,
			Clock clock) {
		this.issuer = issuer;
		this.expiry = Duration.ofMinutes(expiryMinutes);
		this.clock = clock;
		this.key = Keys.hmacShaKeyFor(java.util.Base64.getDecoder().decode(secretBase64));
	}

	public String generate(Employee employee) {
		Instant now = clock.instant();
		return Jwts.builder()
				.subject(String.valueOf(employee.getId()))
				.claim("employeeId", employee.getId())
				.claim("email", employee.getEmail())
				.issuer(issuer)
				.issuedAt(Date.from(now))
				.expiration(Date.from(now.plus(expiry)))
				.signWith(key)
				.compact();
	}

	/** Parses and verifies the token, returning its claims, or throws on invalid/expired. */
	public Claims parse(String token) throws JwtException {
		return Jwts.parser()
				.verifyWith(key)
				.requireIssuer(issuer)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

	public boolean isValid(String token) {
		try {
			parse(token);
			return true;
		} catch (JwtException | IllegalArgumentException e) {
			return false;
		}
	}

	public Long extractEmployeeId(String token) throws JwtException {
		return parse(token).get("employeeId", Long.class);
	}
}