package com.psybergate.staff_engagement.portfolio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * JPA access to {@link Project}. Package-private to the portfolio module.
 */
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p WHERE p.employeeId = :employeeId ORDER BY p.startDate DESC NULLS LAST")
    List<Project> findByEmployeeIdOrdered(@Param("employeeId") Long employeeId);
}
