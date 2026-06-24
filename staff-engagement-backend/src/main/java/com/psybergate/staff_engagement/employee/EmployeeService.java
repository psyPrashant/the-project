package com.psybergate.staff_engagement.employee;

import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import java.util.Optional;

/**
 * Module boundary for the employee identity slice.
 *
 * <p>Cross-module callers (notably the auth module) depend on this interface, never on
 * {@link EmployeeRepository}, keeping the modular monolith splittable.
 */
public interface EmployeeService {

	Optional<Employee> findByEmail(String email);

	Employee findById(Long id);

	EmployeeResponse toResponse(Employee employee);
}