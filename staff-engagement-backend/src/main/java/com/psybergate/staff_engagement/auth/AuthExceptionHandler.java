package com.psybergate.staff_engagement.auth;

import com.psybergate.staff_engagement.common.exception.ErrorResponse;
import java.time.Clock;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Auth-specific error mapping (F6). Authentication failures — bad credentials, a missing/malformed/
 * expired JWT, or an unknown user — map to 401; authorization failures map to 403. This covers
 * {@link JwtAuthException} and {@code UsernameNotFoundException}/{@code BadCredentialsException},
 * all of which extend {@link AuthenticationException}. App-wide validation, not-found, and
 * unexpected errors are handled by {@code GlobalExceptionHandler} in the {@code common} module.
 *
 * <p>Ordered first so its specific handlers take precedence over the generic catch-all in
 * {@code GlobalExceptionHandler}.
 */
@RestControllerAdvice
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE)
public class AuthExceptionHandler {

	private final Clock clock;

	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ErrorResponse> unauthorized(Exception ex) {
		return response(HttpStatus.UNAUTHORIZED, "Invalid credentials");
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ErrorResponse> forbidden(Exception ex) {
		return response(HttpStatus.FORBIDDEN, "Access denied");
	}

	private ResponseEntity<ErrorResponse> response(HttpStatus status, String message) {
		ErrorResponse body = new ErrorResponse(status.value(), message, Instant.now(clock));
		return ResponseEntity.status(status).body(body);
	}
}