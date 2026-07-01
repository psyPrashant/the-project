package com.psybergate.staff_engagement.skills;

import com.psybergate.staff_engagement.skills.dto.AddEmployeeSkillRequest;
import com.psybergate.staff_engagement.skills.dto.EmployeeSkillResponse;
import com.psybergate.staff_engagement.skills.dto.EmployeeWithSkillsResponse;
import com.psybergate.staff_engagement.skills.dto.SkillSearchResultResponse;
import com.psybergate.staff_engagement.skills.dto.SkillSummaryResponse;
import com.psybergate.staff_engagement.skills.dto.UpdateEmployeeSkillRequest;
import java.util.List;

public interface SkillService {

    EmployeeSkillResponse addSkillToEmployee(Long employeeId, AddEmployeeSkillRequest request);

    EmployeeSkillResponse updateEmployeeSkill(Long employeeId, Long skillId, UpdateEmployeeSkillRequest request);

    void removeEmployeeSkill(Long employeeId, Long skillId);

    EmployeeSkillResponse linkProject(Long employeeId, Long skillId, Long projectId);

    void unlinkProject(Long employeeId, Long skillId, Long projectId);

    List<EmployeeSkillResponse> getSkillsForEmployee(Long employeeId);

    List<SkillSummaryResponse> browseRegister();

    List<SkillSearchResultResponse> searchBySkill(String skillName);

    List<EmployeeWithSkillsResponse> getAllEmployeeSkills();
}
