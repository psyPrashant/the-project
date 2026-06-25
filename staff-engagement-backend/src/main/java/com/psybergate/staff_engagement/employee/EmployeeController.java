package com.psybergate.staff_engagement.employee;

import com.psybergate.staff_engagement.employee.dto.CreateEmployeeRequest;
import com.psybergate.staff_engagement.employee.dto.EmployeeProfileResponse;
import com.psybergate.staff_engagement.employee.dto.UpdateEmployeeRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

	private final EmployeeService employeeService;

	@PostMapping
	public ResponseEntity<EmployeeProfileResponse> create(@Valid @RequestBody CreateEmployeeRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.createEmployee(request));
	}

	@GetMapping
	public ResponseEntity<List<EmployeeProfileResponse>> list(
			@RequestParam(required = false) String search) {
		List<EmployeeProfileResponse> result = (search != null && !search.isBlank())
				? employeeService.search(search)
				: employeeService.listAll();
		return ResponseEntity.ok(result);
	}

	@GetMapping("/{id}")
	public ResponseEntity<EmployeeProfileResponse> getProfile(@PathVariable Long id) {
		return ResponseEntity.ok(employeeService.getProfile(id));
	}

	@PutMapping("/{id}")
	public ResponseEntity<EmployeeProfileResponse> update(
			@PathVariable Long id,
			@Valid @RequestBody UpdateEmployeeRequest request) {
		return ResponseEntity.ok(employeeService.updateEmployee(id, request));
	}

	@PatchMapping("/{id}/archive")
	public ResponseEntity<Void> archive(@PathVariable Long id) {
		employeeService.archive(id);
		return ResponseEntity.noContent().build();
	}
}
