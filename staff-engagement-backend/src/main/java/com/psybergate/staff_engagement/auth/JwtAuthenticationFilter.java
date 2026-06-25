package com.psybergate.staff_engagement.auth;

import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import io.jsonwebtoken.JwtException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Extracts the Bearer JWT, resolves the Employee fresh from {@link EmployeeService} (D3 —
 * identity is authoritative on every request), and populates the {@link SecurityContextHolder}.
 *
 * <p>On any token problem the context is simply left empty so the authorization filter returns
 * 401. A subject that no longer maps to an Employee (deleted between issuance and this request)
 * is treated the same way — the token is no longer proof of a valid identity. Note that
 * {@code @RestControllerAdvice} does not catch exceptions thrown from filters, so this must be
 * handled here, not in {@code GlobalExceptionHandler}. Resolution goes through the service interface
 * (never the repository) and runs inside the service's transaction, keeping
 * {@code open-in-view=false} safe.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private static final String BEARER = "Bearer ";

	private final JwtService jwtService;
	private final EmployeeService employeeService;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
			FilterChain chain) throws ServletException, IOException {
		String header = request.getHeader("Authorization");
		if (header != null && header.startsWith(BEARER)) {
			String token = header.substring(BEARER.length());
			try {
				Long employeeId = jwtService.extractEmployeeId(token);
				Employee employee = employeeService.findById(employeeId);
				UserDetails principal = new EmployeePrincipal(
						employee.getId(), employee.getEmail(), employee.getPasswordHash());
				UsernamePasswordAuthenticationToken auth =
						new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
				SecurityContextHolder.getContext().setAuthentication(auth);
			} catch (JwtException | IllegalArgumentException | EntityNotFoundException e) {
				// Invalid/expired token, or a subject that no longer resolves to an Employee —
				// leave context empty; the authorization filter will return 401.
				SecurityContextHolder.clearContext();
			}
		}
		chain.doFilter(request, response);
	}
}