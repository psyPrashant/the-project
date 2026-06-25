package com.psybergate.staff_engagement.employee;

import com.psybergate.staff_engagement.employee.dto.CreateEmployeeRequest;
import com.psybergate.staff_engagement.employee.dto.EmployeeProfileResponse;
import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import com.psybergate.staff_engagement.employee.dto.UpdateEmployeeRequest;
import java.util.List;
import java.util.Optional;

/**
 * Module boundary for the employee module.
 *
 * <p>Cross-module callers (notably the auth module) depend on this interface, never on
 * {@link EmployeeRepository}, keeping the modular monolith splittable.
 */
public interface EmployeeService {

	Optional<Employee> findByEmail(String email);

	Employee findById(Long id);

	EmployeeResponse toResponse(Employee employee);

	List<EmployeeProfileResponse> getEmployees(String query);

	EmployeeProfileResponse createEmployee(CreateEmployeeRequest request);

	EmployeeProfileResponse getProfile(Long id);

	EmployeeProfileResponse updateEmployee(Long id, UpdateEmployeeRequest request);

	void archive(Long id);
}
