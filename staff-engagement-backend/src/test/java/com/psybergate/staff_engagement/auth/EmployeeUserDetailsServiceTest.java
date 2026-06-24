package com.psybergate.staff_engagement.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@ExtendWith(MockitoExtension.class)
class EmployeeUserDetailsServiceTest {

	@Mock
	private EmployeeService employeeService;

	@InjectMocks
	private EmployeeUserDetailsService userDetailsService;

	private Employee employee;

	@BeforeEach
	void setUp() {
		employee = Employee.builder()
				.id(7L).email("jane@psybergate.com").firstName("Jane").lastName("Doe")
				.passwordHash("$2a$10$hash").build();
	}

	@Test
	void loadsExistingEmployeeAsPrincipal() {
		when(employeeService.findByEmail("jane@psybergate.com")).thenReturn(Optional.of(employee));

		EmployeePrincipal principal = (EmployeePrincipal) userDetailsService.loadUserByUsername("jane@psybergate.com");

		assertThat(principal.employeeId()).isEqualTo(7L);
		assertThat(principal.email()).isEqualTo("jane@psybergate.com");
		assertThat(principal.getPassword()).isEqualTo("$2a$10$hash");
		assertThat(principal.getAuthorities()).extracting("authority").contains("ROLE_EMPLOYEE");
	}

	@Test
	void missingEmployeeThrows() {
		when(employeeService.findByEmail("nobody@psybergate.com")).thenReturn(Optional.empty());

		assertThatThrownBy(() -> userDetailsService.loadUserByUsername("nobody@psybergate.com"))
				.isInstanceOf(UsernameNotFoundException.class);
	}
}