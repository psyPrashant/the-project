package com.psybergate.staff_engagement.skills;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.psybergate.staff_engagement.common.exception.DuplicateResourceException;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import com.psybergate.staff_engagement.portfolio.PortfolioService;
import com.psybergate.staff_engagement.skills.dto.AddEmployeeSkillRequest;
import com.psybergate.staff_engagement.skills.dto.EmployeeSkillResponse;
import com.psybergate.staff_engagement.skills.dto.SkillSearchResultResponse;
import com.psybergate.staff_engagement.skills.dto.SkillSummaryResponse;
import com.psybergate.staff_engagement.skills.dto.UpdateEmployeeSkillRequest;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SkillServiceImplTest {

    @Mock private SkillRepository skillRepository;
    @Mock private EmployeeSkillRepository employeeSkillRepository;
    @Mock private EmployeeService employeeService;
    @Mock private PortfolioService portfolioService;

    @InjectMocks
    private SkillServiceImpl skillService;

    private static final Long EMP_ID = 1L;
    private static final Long SKILL_ENTRY_ID = 10L;

    // findOrCreate: new skill name creates Skill

    @Test
    void addSkillToEmployee_newSkillName_createsCanonicalSkill() {
        Employee employee = Employee.builder().id(EMP_ID).build();
        when(employeeService.findById(EMP_ID)).thenReturn(employee);
        when(skillRepository.findByNameIgnoreCase("Angular")).thenReturn(Optional.empty());
        Skill savedSkill = Skill.builder().id(1L).name("Angular").build();
        when(skillRepository.save(any(Skill.class))).thenReturn(savedSkill);
        when(employeeSkillRepository.existsByEmployeeIdAndSkillId(EMP_ID, 1L)).thenReturn(false);
        EmployeeSkill savedEs = EmployeeSkill.builder().id(SKILL_ENTRY_ID).employeeId(EMP_ID).skill(savedSkill).years(3).build();
        when(employeeSkillRepository.save(any(EmployeeSkill.class))).thenReturn(savedEs);
        when(employeeSkillRepository.countProjectsByEmployeeSkillId(SKILL_ENTRY_ID)).thenReturn(0L);

        EmployeeSkillResponse response = skillService.addSkillToEmployee(EMP_ID, new AddEmployeeSkillRequest("Angular", 3));

        assertThat(response.skillName()).isEqualTo("Angular");
        assertThat(response.years()).isEqualTo(3);
        assertThat(response.projectCount()).isZero();
    }

    // findOrCreate: existing skill name reuses canonical Skill

    @Test
    void addSkillToEmployee_existingSkillName_reusesCanonicalSkill() {
        Employee employee = Employee.builder().id(EMP_ID).build();
        Skill existing = Skill.builder().id(5L).name("Java").build();
        when(employeeService.findById(EMP_ID)).thenReturn(employee);
        when(skillRepository.findByNameIgnoreCase("java")).thenReturn(Optional.of(existing));
        when(employeeSkillRepository.existsByEmployeeIdAndSkillId(EMP_ID, 5L)).thenReturn(false);
        EmployeeSkill savedEs = EmployeeSkill.builder().id(SKILL_ENTRY_ID).employeeId(EMP_ID).skill(existing).years(5).build();
        when(employeeSkillRepository.save(any(EmployeeSkill.class))).thenReturn(savedEs);
        when(employeeSkillRepository.countProjectsByEmployeeSkillId(SKILL_ENTRY_ID)).thenReturn(0L);

        EmployeeSkillResponse response = skillService.addSkillToEmployee(EMP_ID, new AddEmployeeSkillRequest("java", 5));

        assertThat(response.skillId()).isEqualTo(5L);
    }

    // Duplicate skill for same employee throws 409

    @Test
    void addSkillToEmployee_duplicateSkill_throwsDuplicateResourceException() {
        Employee employee = Employee.builder().id(EMP_ID).build();
        Skill skill = Skill.builder().id(1L).name("Angular").build();
        when(employeeService.findById(EMP_ID)).thenReturn(employee);
        when(skillRepository.findByNameIgnoreCase("Angular")).thenReturn(Optional.of(skill));
        when(employeeSkillRepository.existsByEmployeeIdAndSkillId(EMP_ID, 1L)).thenReturn(true);

        assertThatThrownBy(() -> skillService.addSkillToEmployee(EMP_ID, new AddEmployeeSkillRequest("Angular", 2)))
                .isInstanceOf(DuplicateResourceException.class);
    }

    // Unknown employee throws EntityNotFoundException

    @Test
    void addSkillToEmployee_unknownEmployee_throwsEntityNotFoundException() {
        when(employeeService.findById(99L)).thenThrow(new EntityNotFoundException("Employee not found"));

        assertThatThrownBy(() -> skillService.addSkillToEmployee(99L, new AddEmployeeSkillRequest("Go", 1)))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // searchBySkill ranking: years desc, then projectCount desc

    @Test
    void searchBySkill_multipleResults_sortedByYearsDescThenProjectCountDesc() {
        // Sorting is performed inside the JPQL query; the service delegates directly to the repo.
        // The mock returns results already in ranked order (Carol: 5 yrs 4 proj > Alice: 5 yrs 2 proj > Bob: 3 yrs).
        SkillSearchResultResponse carol = new SkillSearchResultResponse(3L, "Carol C", "Angular", 5, 4);
        SkillSearchResultResponse alice = new SkillSearchResultResponse(1L, "Alice A", "Angular", 5, 2);
        SkillSearchResultResponse bob   = new SkillSearchResultResponse(2L, "Bob B",   "Angular", 3, 1);

        when(employeeSkillRepository.searchBySkillName("Angular"))
                .thenReturn(List.of(carol, alice, bob));

        List<SkillSearchResultResponse> results = skillService.searchBySkill("Angular");

        assertThat(results).hasSize(3);
        assertThat(results.get(0).employeeId()).isEqualTo(3L);
        assertThat(results.get(1).employeeId()).isEqualTo(1L);
        assertThat(results.get(2).employeeId()).isEqualTo(2L);
    }

    // searchBySkill for unknown skill returns empty list

    @Test
    void searchBySkill_noMatches_returnsEmptyList() {
        when(employeeSkillRepository.searchBySkillName("COBOL"))
                .thenReturn(List.of());

        assertThat(skillService.searchBySkill("COBOL")).isEmpty();
    }

    // updateEmployeeSkill: persists new years and returns updated response

    @Test
    void updateEmployeeSkill_validRequest_updatesYears() {
        Skill skill = Skill.builder().id(1L).name("Go").build();
        EmployeeSkill existing = EmployeeSkill.builder().id(SKILL_ENTRY_ID).employeeId(EMP_ID).skill(skill).years(2).build();
        when(employeeSkillRepository.findByEmployeeIdAndId(EMP_ID, SKILL_ENTRY_ID)).thenReturn(Optional.of(existing));
        EmployeeSkill saved = EmployeeSkill.builder().id(SKILL_ENTRY_ID).employeeId(EMP_ID).skill(skill).years(7).build();
        when(employeeSkillRepository.save(any(EmployeeSkill.class))).thenReturn(saved);
        when(employeeSkillRepository.countProjectsByEmployeeSkillId(SKILL_ENTRY_ID)).thenReturn(0L);

        EmployeeSkillResponse response = skillService.updateEmployeeSkill(EMP_ID, SKILL_ENTRY_ID, new UpdateEmployeeSkillRequest(7));

        assertThat(response.years()).isEqualTo(7);
        verify(employeeSkillRepository).save(any(EmployeeSkill.class));
    }

    @Test
    void updateEmployeeSkill_unknownEntry_throwsEntityNotFoundException() {
        when(employeeSkillRepository.findByEmployeeIdAndId(EMP_ID, 99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> skillService.updateEmployeeSkill(EMP_ID, 99L, new UpdateEmployeeSkillRequest(5)))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // removeEmployeeSkill: delegates to repository delete

    @Test
    void removeEmployeeSkill_existingEntry_deletesIt() {
        Skill skill = Skill.builder().id(1L).name("Go").build();
        EmployeeSkill existing = EmployeeSkill.builder().id(SKILL_ENTRY_ID).employeeId(EMP_ID).skill(skill).years(2).build();
        when(employeeSkillRepository.findByEmployeeIdAndId(EMP_ID, SKILL_ENTRY_ID)).thenReturn(Optional.of(existing));

        skillService.removeEmployeeSkill(EMP_ID, SKILL_ENTRY_ID);

        verify(employeeSkillRepository).delete(existing);
    }

    @Test
    void removeEmployeeSkill_unknownEntry_throwsEntityNotFoundException() {
        when(employeeSkillRepository.findByEmployeeIdAndId(EMP_ID, 99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> skillService.removeEmployeeSkill(EMP_ID, 99L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // linkProject: guards against unknown project, then inserts join-table row

    @Test
    void linkProject_validRequest_insertsLinkAndReturnsResponse() {
        long projectId = 5L;
        Skill skill = Skill.builder().id(1L).name("Angular").build();
        EmployeeSkill existing = EmployeeSkill.builder().id(SKILL_ENTRY_ID).employeeId(EMP_ID).skill(skill).years(3).build();
        when(employeeSkillRepository.findByEmployeeIdAndId(EMP_ID, SKILL_ENTRY_ID)).thenReturn(Optional.of(existing));
        when(portfolioService.projectExists(projectId)).thenReturn(true);
        when(employeeSkillRepository.countProjectsByEmployeeSkillId(SKILL_ENTRY_ID)).thenReturn(1L);

        EmployeeSkillResponse response = skillService.linkProject(EMP_ID, SKILL_ENTRY_ID, projectId);

        verify(employeeSkillRepository).insertSkillProject(SKILL_ENTRY_ID, projectId);
        assertThat(response.projectCount()).isEqualTo(1L);
    }

    @Test
    void linkProject_unknownProject_throwsEntityNotFoundException() {
        long projectId = 99L;
        Skill skill = Skill.builder().id(1L).name("Angular").build();
        EmployeeSkill existing = EmployeeSkill.builder().id(SKILL_ENTRY_ID).employeeId(EMP_ID).skill(skill).years(3).build();
        when(employeeSkillRepository.findByEmployeeIdAndId(EMP_ID, SKILL_ENTRY_ID)).thenReturn(Optional.of(existing));
        when(portfolioService.projectExists(projectId)).thenReturn(false);

        assertThatThrownBy(() -> skillService.linkProject(EMP_ID, SKILL_ENTRY_ID, projectId))
                .isInstanceOf(EntityNotFoundException.class);
        verify(employeeSkillRepository, never()).insertSkillProject(anyLong(), anyLong());
    }

    // unlinkProject: delegates to repository delete join-table row

    @Test
    void unlinkProject_existingLink_deletesIt() {
        long projectId = 5L;
        Skill skill = Skill.builder().id(1L).name("Angular").build();
        EmployeeSkill existing = EmployeeSkill.builder().id(SKILL_ENTRY_ID).employeeId(EMP_ID).skill(skill).years(3).build();
        when(employeeSkillRepository.findByEmployeeIdAndId(EMP_ID, SKILL_ENTRY_ID)).thenReturn(Optional.of(existing));

        skillService.unlinkProject(EMP_ID, SKILL_ENTRY_ID, projectId);

        verify(employeeSkillRepository).deleteSkillProject(SKILL_ENTRY_ID, projectId);
    }

    // browseRegister: delegates to skill repository

    @Test
    void browseRegister_returnsDelegatedList() {
        List<SkillSummaryResponse> summaries = List.of(new SkillSummaryResponse(1L, "Angular", 3L));
        when(skillRepository.findSkillSummaries()).thenReturn(summaries);

        assertThat(skillService.browseRegister()).isSameAs(summaries);
    }

    // projectCount derivation

    @Test
    void getSkillsForEmployee_derivesProjectCountFromLinks() {
        Skill skill = Skill.builder().id(1L).name("Docker").build();
        EmployeeSkill es = EmployeeSkill.builder().id(SKILL_ENTRY_ID).employeeId(EMP_ID).skill(skill).years(2).build();
        when(employeeService.findById(EMP_ID)).thenReturn(Employee.builder().id(EMP_ID).build());
        when(employeeSkillRepository.findByEmployeeId(EMP_ID)).thenReturn(List.of(es));
        when(employeeSkillRepository.countProjectsByEmployeeSkillId(SKILL_ENTRY_ID)).thenReturn(3L);

        List<EmployeeSkillResponse> responses = skillService.getSkillsForEmployee(EMP_ID);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).projectCount()).isEqualTo(3L);
    }
}
