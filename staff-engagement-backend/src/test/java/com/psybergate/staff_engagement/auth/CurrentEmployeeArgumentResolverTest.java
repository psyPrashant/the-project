package com.psybergate.staff_engagement.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class CurrentEmployeeArgumentResolverTest {

	@Mock
	private EmployeeService employeeService;

	@InjectMocks
	private CurrentEmployeeArgumentResolver resolver;

	@AfterEach
	void clearContext() {
		SecurityContextHolder.clearContext();
	}

	@Test
	void resolvesEmployeeFromSecurityContext() {
		EmployeePrincipal principal = new EmployeePrincipal(7L, "jane@psybergate.com", "$2a$10$hash");
		SecurityContextHolder.getContext().setAuthentication(
				new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
		Employee employee = Employee.builder().id(7L).email("jane@psybergate.com").build();
		when(employeeService.findById(7L)).thenReturn(employee);

		assertThat(resolver.resolveArgument(null, null, null, null)).isSameAs(employee);
	}

	@Test
	void throwsWhenNoAuthentication() {
		SecurityContextHolder.clearContext();
		assertThatThrownBy(() -> resolver.resolveArgument(null, null, null, null))
				.isInstanceOf(JwtAuthException.class);
	}

	@Test
	void throwsWhenPrincipalIsNotEmployeePrincipal() {
		SecurityContextHolder.getContext().setAuthentication(
				new UsernamePasswordAuthenticationToken("not-an-employee", null, java.util.List.of()));
		assertThatThrownBy(() -> resolver.resolveArgument(null, null, null, null))
				.isInstanceOf(JwtAuthException.class);
	}

	@Test
	void throwsJwtAuthExceptionWhenEmployeeNoLongerExists() {
		// A valid principal whose Employee has been deleted must surface as an auth failure (401 via
		// JwtAuthException), not let EntityNotFoundException bubble up as a 404 that leaks existence.
		EmployeePrincipal principal = new EmployeePrincipal(7L, "jane@psybergate.com", "$2a$10$hash");
		SecurityContextHolder.getContext().setAuthentication(
				new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
		when(employeeService.findById(7L)).thenThrow(new EntityNotFoundException("Employee not found: 7"));

		assertThatThrownBy(() -> resolver.resolveArgument(null, null, null, null))
				.isInstanceOf(JwtAuthException.class)
				.hasCauseInstanceOf(EntityNotFoundException.class);
	}
}