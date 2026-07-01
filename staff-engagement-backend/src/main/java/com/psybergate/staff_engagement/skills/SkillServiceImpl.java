package com.psybergate.staff_engagement.skills;

import com.psybergate.staff_engagement.common.exception.DuplicateResourceException;
import com.psybergate.staff_engagement.employee.EmployeeService;
import com.psybergate.staff_engagement.portfolio.PortfolioService;
import com.psybergate.staff_engagement.skills.dto.AddEmployeeSkillRequest;
import com.psybergate.staff_engagement.skills.dto.EmployeeSkillResponse;
import com.psybergate.staff_engagement.skills.dto.SkillSearchResultResponse;
import com.psybergate.staff_engagement.skills.dto.SkillSummaryResponse;
import com.psybergate.staff_engagement.skills.dto.UpdateEmployeeSkillRequest;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final EmployeeService employeeService;
    private final PortfolioService portfolioService;

    @Override
    public EmployeeSkillResponse addSkillToEmployee(Long employeeId, AddEmployeeSkillRequest request) {
        employeeService.findById(employeeId);
        Skill skill = findOrCreate(request.skillName());
        if (employeeSkillRepository.existsByEmployeeIdAndSkillId(employeeId, skill.getId())) {
            throw new DuplicateResourceException("Employee already has skill: " + skill.getName());
        }
        EmployeeSkill employeeSkill = EmployeeSkill.builder()
                .employeeId(employeeId)
                .skill(skill)
                .years(request.years())
                .build();
        return toResponse(employeeSkillRepository.save(employeeSkill));
    }

    @Override
    public EmployeeSkillResponse updateEmployeeSkill(Long employeeId, Long skillId, UpdateEmployeeSkillRequest request) {
        EmployeeSkill employeeSkill = findEmployeeSkill(employeeId, skillId);
        employeeSkill.setYears(request.years());
        return toResponse(employeeSkillRepository.save(employeeSkill));
    }

    @Override
    public void removeEmployeeSkill(Long employeeId, Long skillId) {
        EmployeeSkill employeeSkill = findEmployeeSkill(employeeId, skillId);
        employeeSkillRepository.delete(employeeSkill);
    }

    @Override
    public EmployeeSkillResponse linkProject(Long employeeId, Long skillId, Long projectId) {
        EmployeeSkill employeeSkill = findEmployeeSkill(employeeId, skillId);
        if (!portfolioService.projectExists(projectId)) {
            throw new EntityNotFoundException("Project not found: " + projectId);
        }
        employeeSkillRepository.insertSkillProject(employeeSkill.getId(), projectId);
        return toResponse(employeeSkill);
    }

    @Override
    public void unlinkProject(Long employeeId, Long skillId, Long projectId) {
        EmployeeSkill employeeSkill = findEmployeeSkill(employeeId, skillId);
        employeeSkillRepository.deleteSkillProject(employeeSkill.getId(), projectId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeSkillResponse> getSkillsForEmployee(Long employeeId) {
        employeeService.findById(employeeId);
        return employeeSkillRepository.findByEmployeeId(employeeId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SkillSummaryResponse> browseRegister() {
        return skillRepository.findSkillSummaries();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SkillSearchResultResponse> searchBySkill(String skillName) {
        return employeeSkillRepository.searchBySkillName(skillName);
    }

    private Skill findOrCreate(String name) {
        return skillRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> skillRepository.save(Skill.builder().name(name).build()));
    }

    private EmployeeSkill findEmployeeSkill(Long employeeId, Long skillId) {
        return employeeSkillRepository.findByEmployeeIdAndId(employeeId, skillId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Employee skill not found: employeeId=" + employeeId + ", skillId=" + skillId));
    }

    private EmployeeSkillResponse toResponse(EmployeeSkill es) {
        long projectCount = employeeSkillRepository.countProjectsByEmployeeSkillId(es.getId());
        return new EmployeeSkillResponse(
                es.getId(),
                es.getSkill().getId(),
                es.getSkill().getName(),
                es.getYears(),
                projectCount);
    }
}
