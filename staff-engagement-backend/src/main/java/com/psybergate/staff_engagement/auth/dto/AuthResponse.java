package com.psybergate.staff_engagement.auth.dto;

/** Result of a successful login: the JWT plus the resolved Employee's identity (D3). */
public record AuthResponse(String token, Long employeeId, String email, String firstName, String lastName) {
}