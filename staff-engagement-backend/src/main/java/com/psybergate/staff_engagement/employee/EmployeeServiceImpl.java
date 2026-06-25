package com.psybergate.staff_engagement.employee;

import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import jakarta.persistence.EntityNotFoundException;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

	private final EmployeeRepository employeeRepository;

	@Override
	@Transactional(readOnly = true)
	public Optional<Employee> findByEmail(String email) {
		return employeeRepository.findByEmail(email);
	}

	@Override
	@Transactional(readOnly = true)
	public Employee findById(Long id) {
		return employeeRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));
	}

	@Override
	public EmployeeResponse toResponse(Employee employee) {
		return new EmployeeResponse(
				employee.getId(),
				employee.getEmail(),
				employee.getFirstName(),
				employee.getLastName());
	}
}