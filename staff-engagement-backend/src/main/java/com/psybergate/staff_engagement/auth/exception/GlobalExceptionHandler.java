package com.psybergate.staff_engagement.auth.exception;

import com.psybergate.staff_engagement.auth.JwtAuthException;
import jakarta.persistence.EntityNotFoundException;
import java.time.Clock;
import java.time.Instant;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Single error contract for the API (F6). Maps auth/validation/not-found/generic exceptions to a
 * consistent {@link ErrorResponse}.
 */
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

	private final Clock clock;

	@ExceptionHandler({AuthenticationException.class, JwtAuthException.class, UsernameNotFoundException.class})
	public ResponseEntity<ErrorResponse> unauthorized(Exception ex) {
		return response(HttpStatus.UNAUTHORIZED, "Invalid credentials");
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ErrorResponse> forbidden(Exception ex) {
		return response(HttpStatus.FORBIDDEN, "Access denied");
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException ex) {
		String detail = ex.getBindingResult().getFieldErrors().stream()
				.map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
				.collect(Collectors.joining("; "));
		return response(HttpStatus.BAD_REQUEST, detail.isBlank() ? "Validation failed" : detail);
	}

	@ExceptionHandler(EntityNotFoundException.class)
	public ResponseEntity<ErrorResponse> notFound(EntityNotFoundException ex) {
		return response(HttpStatus.NOT_FOUND, ex.getMessage());
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> generic(Exception ex) {
		return response(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
	}

	private ResponseEntity<ErrorResponse> response(HttpStatus status, String message) {
		ErrorResponse body = new ErrorResponse(status.value(), message, Instant.now(clock));
		return ResponseEntity.status(status).body(body);
	}
}