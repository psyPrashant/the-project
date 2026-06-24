package com.psybergate.staff_engagement.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.psybergate.staff_engagement.auth.exception.GlobalExceptionHandler;
import com.psybergate.staff_engagement.config.AppConfig;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Security slice: exercises the {@code SecurityConfig} filter chain — protected-endpoint
 * refusal (401), token resolution (200), malformed-token refusal (401), and that {@code /login}
 * is permitted (400 on bad body, not 401).
 */
@WebMvcTest(AuthController.class)
@Import({AppConfig.class, SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class,
		EmployeeUserDetailsService.class, CurrentEmployeeArgumentResolver.class, WebMvcConfig.class,
		GlobalExceptionHandler.class})
class SecurityConfigTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JwtService jwtService;

	@MockBean
	private EmployeeService employeeService;

	private Employee employee;
	private String validToken;

	@BeforeEach
	void setUp() {
		employee = Employee.builder()
				.id(42L).email("admin@psybergate.com").firstName("Admin").lastName("User")
				.passwordHash("$2a$10$hash").build();
		when(employeeService.findById(anyLong())).thenReturn(employee);
		when(employeeService.toResponse(any(Employee.class)))
				.thenReturn(new EmployeeResponse(42L, "admin@psybergate.com", "Admin", "User"));
		validToken = jwtService.generate(employee);
	}

	@Test
	void meRefusesUnauthenticatedRequest() throws Exception {
		mockMvc.perform(get("/api/auth/me"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.status").value(401));
	}

	@Test
	void meResolvesCurrentEmployeeWithValidToken() throws Exception {
		mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + validToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("admin@psybergate.com"))
				.andExpect(jsonPath("$.firstName").value("Admin"));
	}

	@Test
	void meRefusesMalformedToken() throws Exception {
		mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer not-a-real-jwt"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void loginIsPermittedAndReturns400OnInvalidBody() throws Exception {
		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"","password":""}
								"""))
				.andExpect(status().isBadRequest());
	}
}