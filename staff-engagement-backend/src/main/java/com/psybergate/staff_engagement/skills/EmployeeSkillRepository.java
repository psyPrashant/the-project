package com.psybergate.staff_engagement.skills;

import com.psybergate.staff_engagement.skills.dto.SkillSearchResultResponse;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Long> {

    List<EmployeeSkill> findByEmployeeId(Long employeeId);

    Optional<EmployeeSkill> findByEmployeeIdAndId(Long employeeId, Long id);

    boolean existsByEmployeeIdAndSkillId(Long employeeId, Long skillId);

    @Query("SELECT new com.psybergate.staff_engagement.skills.dto.SkillSearchResultResponse(" +
           "es.employeeId, CONCAT(e.firstName, ' ', e.lastName), s.name, es.years, COUNT(p)) " +
           "FROM EmployeeSkill es " +
           "JOIN es.skill s " +
           "JOIN Employee e ON e.id = es.employeeId " +
           "LEFT JOIN es.projects p " +
           "WHERE LOWER(s.name) = LOWER(:skillName) " +
           "GROUP BY es.employeeId, e.firstName, e.lastName, s.name, es.years " +
           "ORDER BY es.years DESC, COUNT(p) DESC")
    List<SkillSearchResultResponse> searchBySkillName(@Param("skillName") String skillName);

    @Query("SELECT new com.psybergate.staff_engagement.skills.EmployeeSkillRow(" +
           "e.id, CONCAT(e.firstName, ' ', e.lastName), es.id, s.id, s.name, es.years, COUNT(p)) " +
           "FROM EmployeeSkill es " +
           "JOIN es.skill s " +
           "JOIN Employee e ON e.id = es.employeeId " +
           "LEFT JOIN es.projects p " +
           "GROUP BY e.id, e.firstName, e.lastName, es.id, s.id, s.name, es.years " +
           "ORDER BY e.lastName, e.firstName, s.name")
    List<EmployeeSkillRow> findAllEmployeeSkills();

    @Query("SELECT COUNT(p) FROM EmployeeSkill es JOIN es.projects p WHERE es.id = :employeeSkillId")
    long countProjectsByEmployeeSkillId(@Param("employeeSkillId") Long employeeSkillId);

    @Modifying
    @Query(value = "INSERT INTO employee_skill_project (employee_skill_id, project_id) VALUES (:employeeSkillId, :projectId) ON CONFLICT DO NOTHING",
           nativeQuery = true)
    void insertSkillProject(@Param("employeeSkillId") Long employeeSkillId, @Param("projectId") Long projectId);

    @Modifying
    @Query(value = "DELETE FROM employee_skill_project WHERE employee_skill_id = :employeeSkillId AND project_id = :projectId",
           nativeQuery = true)
    void deleteSkillProject(@Param("employeeSkillId") Long employeeSkillId, @Param("projectId") Long projectId);
}
