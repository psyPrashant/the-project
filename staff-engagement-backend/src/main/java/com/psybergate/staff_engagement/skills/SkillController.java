package com.psybergate.staff_engagement.skills;

import com.psybergate.staff_engagement.skills.dto.AddEmployeeSkillRequest;
import com.psybergate.staff_engagement.skills.dto.EmployeeSkillResponse;
import com.psybergate.staff_engagement.skills.dto.EmployeeWithSkillsResponse;
import com.psybergate.staff_engagement.skills.dto.SkillSearchResultResponse;
import com.psybergate.staff_engagement.skills.dto.SkillSummaryResponse;
import com.psybergate.staff_engagement.skills.dto.UpdateEmployeeSkillRequest;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping("/employees/{employeeId}/skills")
    public ResponseEntity<List<EmployeeSkillResponse>> getSkillsForEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(skillService.getSkillsForEmployee(employeeId));
    }

    @PostMapping("/employees/{employeeId}/skills")
    public ResponseEntity<EmployeeSkillResponse> addSkill(
            @PathVariable Long employeeId,
            @Valid @RequestBody AddEmployeeSkillRequest request) {
        EmployeeSkillResponse response = skillService.addSkillToEmployee(employeeId, request);
        URI location = URI.create("/api/employees/" + employeeId + "/skills/" + response.id());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/employees/{employeeId}/skills/{skillId}")
    public ResponseEntity<EmployeeSkillResponse> updateSkill(
            @PathVariable Long employeeId,
            @PathVariable Long skillId,
            @Valid @RequestBody UpdateEmployeeSkillRequest request) {
        return ResponseEntity.ok(skillService.updateEmployeeSkill(employeeId, skillId, request));
    }

    @DeleteMapping("/employees/{employeeId}/skills/{skillId}")
    public ResponseEntity<Void> deleteSkill(
            @PathVariable Long employeeId,
            @PathVariable Long skillId) {
        skillService.removeEmployeeSkill(employeeId, skillId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/employees/{employeeId}/skills/{skillId}/projects/{projectId}")
    public ResponseEntity<EmployeeSkillResponse> linkProject(
            @PathVariable Long employeeId,
            @PathVariable Long skillId,
            @PathVariable Long projectId) {
        return ResponseEntity.ok(skillService.linkProject(employeeId, skillId, projectId));
    }

    @DeleteMapping("/employees/{employeeId}/skills/{skillId}/projects/{projectId}")
    public ResponseEntity<Void> unlinkProject(
            @PathVariable Long employeeId,
            @PathVariable Long skillId,
            @PathVariable Long projectId) {
        skillService.unlinkProject(employeeId, skillId, projectId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/skills")
    public ResponseEntity<List<SkillSummaryResponse>> browseRegister() {
        return ResponseEntity.ok(skillService.browseRegister());
    }

    @GetMapping("/skills/search")
    public ResponseEntity<List<SkillSearchResultResponse>> searchBySkill(
            @RequestParam String skill) {
        return ResponseEntity.ok(skillService.searchBySkill(skill));
    }

    @GetMapping("/skills/employees")
    public ResponseEntity<List<EmployeeWithSkillsResponse>> getAllEmployeeSkills() {
        return ResponseEntity.ok(skillService.getAllEmployeeSkills());
    }
}
