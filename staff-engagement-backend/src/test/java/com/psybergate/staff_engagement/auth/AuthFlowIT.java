package com.psybergate.staff_engagement.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.psybergate.staff_engagement.IntegrationTestBase;
import com.psybergate.staff_engagement.auth.dto.AuthResponse;
import com.psybergate.staff_engagement.auth.dto.LoginRequest;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * End-to-end auth flow against the real Testcontainers Postgres with seeded Employees.
 * Run by Failsafe on {@code mvn verify}.
 */
class AuthFlowIT extends IntegrationTestBase {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private JwtService jwtService;

    private AuthResponse login(String email, String password) throws Exception {
        String body = objectMapper.writeValueAsString(new LoginRequest(email, password));
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);
    }

    @Test
    void validCredentialsReturnJwtAndEmployee() throws Exception {
        AuthResponse auth = login("admin@psybergate.com", "password123");

        assertThat(auth.token()).isNotBlank();
        assertThat(auth.employeeId()).isNotNull();
        assertThat(auth.email()).isEqualTo("admin@psybergate.com");
        assertThat(auth.firstName()).isEqualTo("Admin");
    }

    @Test
    void invalidPasswordIsRejected() throws Exception {
        String body = objectMapper.writeValueAsString(new LoginRequest("admin@psybergate.com", "wrong-password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void unknownEmailIsRejected() throws Exception {
        String body = objectMapper.writeValueAsString(new LoginRequest("nobody@psybergate.com", "password123"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meReturnsCurrentEmployeeWithToken() throws Exception {
        AuthResponse auth = login("admin@psybergate.com", "password123");

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + auth.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@psybergate.com"))
                .andExpect(jsonPath("$.id").value(auth.employeeId().intValue()));
    }

    @Test
    void meRefusesRequestWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meRefusesMalformedToken() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer not-a-real-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void healthRemainsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    void meReturns401WhenEmployeeNoLongerExists() throws Exception {
        Employee ghost = employeeRepository.save(Employee.builder()
                .email("ghost@psybergate.com").firstName("Ghost").lastName("User")
                .passwordHash("$2a$10$hash").build());
        String token = jwtService.generate(ghost);
        employeeRepository.delete(ghost);
        employeeRepository.flush();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void seededEmployeesExist() {
        assertThat(employeeRepository.count()).isGreaterThanOrEqualTo(3);
        assertThat(employeeRepository.findByEmail("admin@psybergate.com")).isPresent();
        assertThat(employeeRepository.findByEmail("jane.doe@psybergate.com")).isPresent();
        assertThat(employeeRepository.findByEmail("john.smith@psybergate.com")).isPresent();
    }
}
