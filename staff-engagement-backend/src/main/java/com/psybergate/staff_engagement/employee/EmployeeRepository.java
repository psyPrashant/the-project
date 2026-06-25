package com.psybergate.staff_engagement.employee;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA access to {@link Employee}.
 *
 * <p>Repository is package-private to its module: cross-module callers go through
 * {@link EmployeeService}, never here.
 */
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

	Optional<Employee> findByEmail(String email);
}