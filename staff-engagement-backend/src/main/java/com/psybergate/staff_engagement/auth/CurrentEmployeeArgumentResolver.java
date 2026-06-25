package com.psybergate.staff_engagement.auth;

import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * Supplies the resolved current {@link Employee} for {@link CurrentEmployee}-annotated params.
 * The single enforcement point for "every user is an Employee" (D3).
 */
@Component
@RequiredArgsConstructor
public class CurrentEmployeeArgumentResolver implements HandlerMethodArgumentResolver {

	private final EmployeeService employeeService;

	@Override
	public boolean supportsParameter(MethodParameter parameter) {
		return parameter.hasParameterAnnotation(CurrentEmployee.class)
				&& Employee.class.isAssignableFrom(parameter.getParameterType());
	}

	@Override
	public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
			NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !(auth.getPrincipal() instanceof EmployeePrincipal principal)) {
			throw new JwtAuthException("No authenticated employee on the request");
		}
		try {
			return employeeService.findById(principal.employeeId());
		} catch (EntityNotFoundException e) {
			// A valid token whose subject no longer exists is an auth failure (401), not a 404 —
			// returning 404 would leak that the id is valid-but-gone. Same semantics as the no-principal
			// branch above.
			throw new JwtAuthException("Authenticated employee no longer exists", e);
		}
	}
}