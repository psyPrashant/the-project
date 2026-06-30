package com.psybergate.staff_engagement.skills;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Long> {

    List<EmployeeSkill> findByEmployeeId(Long employeeId);

    Optional<EmployeeSkill> findByEmployeeIdAndId(Long employeeId, Long id);

    boolean existsByEmployeeIdAndSkillId(Long employeeId, Long skillId);

    @Query("SELECT es FROM EmployeeSkill es JOIN es.skill s WHERE LOWER(s.name) = LOWER(:skillName) ORDER BY es.years DESC")
    List<EmployeeSkill> findBySkillNameIgnoreCaseOrderByYearsDesc(@Param("skillName") String skillName);

    @Query("SELECT COUNT(p) FROM EmployeeSkill es JOIN es.projects p WHERE es.id = :employeeSkillId")
    long countProjectsByEmployeeSkillId(@Param("employeeSkillId") Long employeeSkillId);
}
