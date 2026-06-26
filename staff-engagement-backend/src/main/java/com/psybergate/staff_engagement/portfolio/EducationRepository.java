package com.psybergate.staff_engagement.portfolio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * JPA access to {@link Education}. Package-private to the portfolio module.
 */
public interface EducationRepository extends JpaRepository<Education, Long> {

    @Query("SELECT e FROM Education e WHERE e.employeeId = :employeeId " +
            "ORDER BY e.endYear DESC NULLS LAST, e.startYear DESC")
    List<Education> findByEmployeeIdOrdered(@Param("employeeId") Long employeeId);
}
