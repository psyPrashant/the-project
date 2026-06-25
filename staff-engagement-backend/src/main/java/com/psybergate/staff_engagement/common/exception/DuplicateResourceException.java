package com.psybergate.staff_engagement.common.exception;

/**
 * Thrown when a create or update operation would violate a unique constraint.
 * Mapped to HTTP 409 Conflict by {@link GlobalExceptionHandler}.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
