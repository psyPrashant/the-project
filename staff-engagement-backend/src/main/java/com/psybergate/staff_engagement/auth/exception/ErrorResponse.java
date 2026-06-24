package com.psybergate.staff_engagement.auth.exception;

import java.time.Instant;

/** Consistent API error body (F6 error contract). */
public record ErrorResponse(int status, String message, Instant timestamp) {
}