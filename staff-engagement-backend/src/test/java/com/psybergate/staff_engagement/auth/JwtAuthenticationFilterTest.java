package com.psybergate.staff_engagement.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import io.jsonwebtoken.JwtException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Unit tests for {@link JwtAuthenticationFilter}. The filter is otherwise only exercised through
 * {@code AuthFlowIT}; these mocked tests pin every branch (missing/non-Bearer header, valid token,
 * and each failure mode) so the authentication wiring survives mutation testing.
 */
@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock private JwtService jwtService;
    @Mock private EmployeeService employeeService;
    @Mock private HttpServletRequest request;
    @Mock private HttpServletResponse response;
    @Mock private FilterChain chain;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    private final Employee employee = Employee.builder()
            .id(7L).email("user@x.com").firstName("Us").lastName("Er").passwordHash("$2a$hash").build();

    @BeforeEach
    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void validBearerToken_populatesSecurityContext_andContinuesChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer good.token");
        when(jwtService.extractEmployeeId("good.token")).thenReturn(7L);
        when(employeeService.findById(7L)).thenReturn(employee);

        filter.doFilterInternal(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getPrincipal()).isInstanceOf(EmployeePrincipal.class);
        EmployeePrincipal principal = (EmployeePrincipal) auth.getPrincipal();
        assertThat(principal.employeeId()).isEqualTo(7L);
        assertThat(principal.email()).isEqualTo("user@x.com");
        assertThat(principal.passwordHash()).isEqualTo("$2a$hash");
        verify(chain).doFilter(request, response);
    }

    @Test
    void missingAuthorizationHeader_leavesContextEmpty_andContinuesChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtService, employeeService);
        verify(chain).doFilter(request, response);
    }

    @Test
    void nonBearerHeader_isIgnored_andContinuesChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

        filter.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(jwtService, employeeService);
        verify(chain).doFilter(request, response);
    }

    @Test
    void invalidToken_clearsContext_andContinuesChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer bad.token");
        when(jwtService.extractEmployeeId("bad.token")).thenThrow(new JwtException("bad"));

        filter.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(employeeService, never()).findById(org.mockito.ArgumentMatchers.anyLong());
        verify(chain).doFilter(request, response);
    }

    @Test
    void subjectNoLongerResolvesToEmployee_clearsContext_andContinuesChain() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer stale.token");
        when(jwtService.extractEmployeeId("stale.token")).thenReturn(99L);
        when(employeeService.findById(99L)).thenThrow(new EntityNotFoundException("gone"));

        filter.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(chain).doFilter(request, response);
    }
}
