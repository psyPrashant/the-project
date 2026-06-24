package com.psybergate.staff_engagement.auth;

import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Spring Security principal backed by an Employee (D3). Carries just enough to authenticate
 * (the stored BCrypt hash) and to resolve the Employee on subsequent requests (the id).
 */
public record EmployeePrincipal(Long employeeId, String email, String passwordHash)
		implements UserDetails {

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// POC: a single placeholder authority. No RBAC per D4/D6.
		return List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"));
	}

	@Override
	public String getPassword() {
		return passwordHash;
	}

	@Override
	public String getUsername() {
		return email;
	}
}