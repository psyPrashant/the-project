package com.psybergate.staff_engagement.auth;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.psybergate.staff_engagement.auth.exception.GlobalExceptionHandler;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import java.time.Clock;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

	@Mock
	private AuthenticationManager authenticationManager;

	@Mock
	private EmployeeService employeeService;

	@Mock
	private JwtService jwtService;

	@InjectMocks
	private AuthController authController;

	private MockMvc mockMvc;

	private Employee employee;

	@BeforeEach
	void setUp() {
		employee = Employee.builder()
				.id(42L).email("admin@psybergate.com").firstName("Admin").lastName("User")
				.passwordHash("$2a$10$hash").build();
		mockMvc = MockMvcBuilders.standaloneSetup(authController)
				.setValidator(new LocalValidatorFactoryBean())
				.setControllerAdvice(new GlobalExceptionHandler(Clock.systemDefaultZone()))
				.build();
	}

	@Test
	void loginSucceedsWithValidCredentials() throws Exception {
		when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
		when(employeeService.findByEmail(anyString())).thenReturn(Optional.of(employee));
		when(jwtService.generate(any(Employee.class))).thenReturn("mock-jwt");

		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"admin@psybergate.com","password":"password123"}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.token").value("mock-jwt"))
				.andExpect(jsonPath("$.employeeId").value(42))
				.andExpect(jsonPath("$.email").value("admin@psybergate.com"));
	}

	@Test
	void loginFailsWithInvalidCredentials() throws Exception {
		doThrow(new BadCredentialsException("bad creds"))
				.when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"admin@psybergate.com","password":"wrong"}
								"""))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.status").value(401))
				.andExpect(jsonPath("$.message").value("Invalid credentials"));
	}

	@Test
	void loginReturns400WhenFieldsBlank() throws Exception {
		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"email":"","password":""}
								"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400));
	}
}