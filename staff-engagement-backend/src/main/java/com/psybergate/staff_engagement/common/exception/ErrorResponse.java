package com.psybergate.staff_engagement.common.exception;

import java.time.Instant;

/** Consistent API error body, shared across all controllers. */
public record ErrorResponse(int status, String message, Instant timestamp) {
}