package com.psybergate.staff_engagement.employee.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateEmployeeRequest(
		@NotBlank String firstName,
		@NotBlank String lastName,
		@Email @NotBlank String email,
		String jobTitle,
		String department,
		String phone
) {
}
