package com.psybergate.staff_engagement.employee.dto;

/**
 * API representation of an Employee. Deliberately omits {@code passwordHash} — entities are
 * never exposed over the API.
 */
public record EmployeeResponse(Long id, String email, String firstName, String lastName) {
}