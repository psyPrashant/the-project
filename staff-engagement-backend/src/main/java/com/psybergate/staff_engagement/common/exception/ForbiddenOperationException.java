package com.psybergate.staff_engagement.common.exception;

/**
 * Thrown when an authenticated user attempts an operation they are not allowed to perform.
 * Mapped to HTTP 403 Forbidden by {@link GlobalExceptionHandler}.
 */
public class ForbiddenOperationException extends RuntimeException {

    public ForbiddenOperationException(String message) {
        super(message);
    }
}
