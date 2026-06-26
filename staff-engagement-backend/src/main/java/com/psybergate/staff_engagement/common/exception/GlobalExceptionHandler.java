package com.psybergate.staff_engagement.common.exception;

import jakarta.persistence.EntityNotFoundException;
import java.time.Clock;
import java.time.Instant;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import com.psybergate.staff_engagement.common.exception.DuplicateResourceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * App-wide error contract: maps validation, not-found, and unexpected exceptions to a consistent
 * {@link ErrorResponse}. Auth-specific failures (authentication / access denied) are handled by
 * {@code com.psybergate.staff_engagement.auth.AuthExceptionHandler} so this advice stays free of
 * any dependency on the auth module.
 *
 * <p>Ordered last so its {@code @ExceptionHandler(Exception.class)} catch-all only handles what no
 * more specific advice has claimed. Spring resolves the first matching advice (not the most
 * specific across advices), so a catch-all must run last.
 */
@RestControllerAdvice
@RequiredArgsConstructor
@Order(Ordered.LOWEST_PRECEDENCE)
public class GlobalExceptionHandler {

	private final Clock clock;

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

	@ExceptionHandler(DuplicateResourceException.class)
	public ResponseEntity<ErrorResponse> conflict(DuplicateResourceException ex) {
		return response(HttpStatus.CONFLICT, ex.getMessage());
	}

	@ExceptionHandler(ForbiddenOperationException.class)
	public ResponseEntity<ErrorResponse> forbidden(ForbiddenOperationException ex) {
		return response(HttpStatus.FORBIDDEN, ex.getMessage());
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