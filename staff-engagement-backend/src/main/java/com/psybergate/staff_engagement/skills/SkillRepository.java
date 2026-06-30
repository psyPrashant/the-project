package com.psybergate.staff_engagement.skills;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface SkillRepository extends JpaRepository<Skill, Long> {

    Optional<Skill> findByNameIgnoreCase(String name);

    List<Skill> findAllByOrderByNameAsc();

    @Query("SELECT COUNT(es) FROM EmployeeSkill es WHERE es.skill.id = :skillId")
    long countEmployeesBySkillId(@Param("skillId") Long skillId);
}
