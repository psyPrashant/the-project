package com.psybergate.staff_engagement.employee;

import com.psybergate.staff_engagement.employee.dto.CreateEmployeeRequest;
import com.psybergate.staff_engagement.employee.dto.EmployeeProfileResponse;
import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import com.psybergate.staff_engagement.employee.dto.UpdateEmployeeRequest;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
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

	@Override
	@Transactional(readOnly = true)
	public List<EmployeeProfileResponse> listAll() {
		return employeeRepository.findByArchivedFalse().stream()
				.map(this::toProfileResponse)
				.toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<EmployeeProfileResponse> search(String query) {
		return employeeRepository.searchActiveByName(query).stream()
				.map(this::toProfileResponse)
				.toList();
	}

	@Override
	public EmployeeProfileResponse createEmployee(CreateEmployeeRequest request) {
		Employee employee = Employee.builder()
				.firstName(request.firstName())
				.lastName(request.lastName())
				.email(request.email())
				.jobTitle(request.jobTitle())
				.department(request.department())
				.phone(request.phone())
				.build();
		return toProfileResponse(employeeRepository.save(employee));
	}

	@Override
	@Transactional(readOnly = true)
	public EmployeeProfileResponse getProfile(Long id) {
		Employee employee = employeeRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));
		return toProfileResponse(employee);
	}

	@Override
	public EmployeeProfileResponse updateEmployee(Long id, UpdateEmployeeRequest request) {
		Employee employee = employeeRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));
		employee.setFirstName(request.firstName());
		employee.setLastName(request.lastName());
		employee.setEmail(request.email());
		employee.setJobTitle(request.jobTitle());
		employee.setDepartment(request.department());
		employee.setPhone(request.phone());
		return toProfileResponse(employeeRepository.save(employee));
	}

	@Override
	public void archive(Long id) {
		Employee employee = employeeRepository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException("Employee not found: " + id));
		employee.setArchived(true);
		employeeRepository.save(employee);
	}

	private EmployeeProfileResponse toProfileResponse(Employee employee) {
		return new EmployeeProfileResponse(
				employee.getId(),
				employee.getFirstName(),
				employee.getLastName(),
				employee.getEmail(),
				employee.getJobTitle(),
				employee.getDepartment(),
				employee.getPhone(),
				employee.isArchived());
	}
}
