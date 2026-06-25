package com.psybergate.staff_engagement.auth;

import com.psybergate.staff_engagement.auth.dto.AuthResponse;
import com.psybergate.staff_engagement.auth.dto.LoginRequest;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Login + current-Employee endpoints (F6). {@code POST /login} authenticates and issues a JWT;
 * {@code GET /me} returns the resolved current Employee — the testable proof of D3 and the
 * protected-endpoint behaviour.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthenticationManager authenticationManager;
	private final EmployeeService employeeService;
	private final JwtService jwtService;

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest request) {
		authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.email(), request.password()));
		Employee employee = employeeService.findByEmail(request.email())
				.orElseThrow(() -> new JwtAuthException("Employee not found after authentication"));
		String token = jwtService.generate(employee);
		return new AuthResponse(token, employee.getId(), employee.getEmail(),
				employee.getFirstName(), employee.getLastName());
	}

	@GetMapping("/me")
	public EmployeeResponse me(@CurrentEmployee Employee employee) {
		return employeeService.toResponse(employee);
	}
}