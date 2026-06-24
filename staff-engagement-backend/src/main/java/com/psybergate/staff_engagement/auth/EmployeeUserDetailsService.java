package com.psybergate.staff_engagement.auth;

import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Bridges Spring Security to the {@link EmployeeService} interface (never the repository),
 * honouring the modular-monolith cross-module rule.
 */
@Service
@RequiredArgsConstructor
public class EmployeeUserDetailsService implements UserDetailsService {

	private final EmployeeService employeeService;

	@Override
	public UserDetails loadUserByUsername(String email) {
		Employee employee = employeeService.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("Employee not found: " + email));
		return new EmployeePrincipal(employee.getId(), employee.getEmail(), employee.getPasswordHash());
	}
}