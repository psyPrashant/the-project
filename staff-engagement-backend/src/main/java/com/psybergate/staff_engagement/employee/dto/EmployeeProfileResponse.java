package com.psybergate.staff_engagement.employee.dto;

/** Full profile view of an Employee. Deliberately omits {@code passwordHash}. */
public record EmployeeProfileResponse(
		Long id,
		String firstName,
		String lastName,
		String email,
		String jobTitle,
		String department,
		String phone,
		boolean archived
) {
}
