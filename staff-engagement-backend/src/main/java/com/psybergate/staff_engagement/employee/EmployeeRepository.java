package com.psybergate.staff_engagement.employee;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Spring Data JPA access to {@link Employee}.
 *
 * <p>Repository is package-private to its module: cross-module callers go through
 * {@link EmployeeService}, never here.
 */
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

	Optional<Employee> findByEmail(String email);

	List<Employee> findByArchivedFalse();

	@Query("SELECT e FROM Employee e WHERE e.archived = false AND " +
			"(LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
			"LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')))")
	List<Employee> searchActiveByName(@Param("query") String query);
}