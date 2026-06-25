package com.psybergate.staff_engagement.auth;

import org.springframework.security.core.AuthenticationException;

/** Raised when a presented JWT is missing, malformed, tampered, or expired. */
public class JwtAuthException extends AuthenticationException {

	public JwtAuthException(String message, Throwable cause) {
		super(message, cause);
	}

	public JwtAuthException(String message) {
		super(message);
	}
}