package com.psybergate.staff_engagement.portfolio;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * JPA access to {@link ShowcaseLink}. Package-private to the portfolio module.
 */
public interface ShowcaseLinkRepository extends JpaRepository<ShowcaseLink, Long> {

    @Query("SELECT l FROM ShowcaseLink l WHERE l.employeeId = :employeeId ORDER BY l.sortOrder ASC NULLS LAST, l.label ASC")
    List<ShowcaseLink> findByEmployeeIdOrdered(@Param("employeeId") Long employeeId);
}
