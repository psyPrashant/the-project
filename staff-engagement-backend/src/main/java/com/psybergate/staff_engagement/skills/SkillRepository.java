package com.psybergate.staff_engagement.skills;

import com.psybergate.staff_engagement.skills.dto.SkillSummaryResponse;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface SkillRepository extends JpaRepository<Skill, Long> {

    Optional<Skill> findByNameIgnoreCase(String name);

    @Query("SELECT new com.psybergate.staff_engagement.skills.dto.SkillSummaryResponse(s.id, s.name, COUNT(es)) " +
           "FROM Skill s LEFT JOIN EmployeeSkill es ON es.skill = s " +
           "GROUP BY s.id, s.name " +
           "ORDER BY s.name ASC")
    List<SkillSummaryResponse> findSkillSummaries();
}
