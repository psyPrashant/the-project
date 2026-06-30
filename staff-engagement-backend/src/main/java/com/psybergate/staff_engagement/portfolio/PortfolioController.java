package com.psybergate.staff_engagement.portfolio;

import com.psybergate.staff_engagement.portfolio.dto.CreateEducationRequest;
import com.psybergate.staff_engagement.portfolio.dto.CreateProjectRequest;
import com.psybergate.staff_engagement.portfolio.dto.CreateShowcaseLinkRequest;
import com.psybergate.staff_engagement.portfolio.dto.EducationResponse;
import com.psybergate.staff_engagement.portfolio.dto.PortfolioResponse;
import com.psybergate.staff_engagement.portfolio.dto.ProjectResponse;
import com.psybergate.staff_engagement.portfolio.dto.ShowcaseLinkResponse;
import com.psybergate.staff_engagement.portfolio.dto.UpdateEducationRequest;
import com.psybergate.staff_engagement.portfolio.dto.UpdateProjectRequest;
import com.psybergate.staff_engagement.portfolio.dto.UpdateShowcaseLinkRequest;
import jakarta.validation.Valid;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees/{employeeId}/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping
    public ResponseEntity<PortfolioResponse> getPortfolio(@PathVariable Long employeeId) {
        return ResponseEntity.ok(portfolioService.getPortfolio(employeeId));
    }

    // Education

    @PostMapping("/education")
    public ResponseEntity<EducationResponse> addEducation(
            @PathVariable Long employeeId,
            @Valid @RequestBody CreateEducationRequest request) {
        EducationResponse response = portfolioService.addEducation(employeeId, request);
        URI location = URI.create("/api/employees/" + employeeId + "/portfolio/education/" + response.id());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<EducationResponse> updateEducation(
            @PathVariable Long employeeId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateEducationRequest request) {
        return ResponseEntity.ok(portfolioService.updateEducation(employeeId, id, request));
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<Void> deleteEducation(@PathVariable Long employeeId, @PathVariable Long id) {
        portfolioService.deleteEducation(employeeId, id);
        return ResponseEntity.noContent().build();
    }

    // Projects

    @PostMapping("/projects")
    public ResponseEntity<ProjectResponse> addProject(
            @PathVariable Long employeeId,
            @Valid @RequestBody CreateProjectRequest request) {
        ProjectResponse response = portfolioService.addProject(employeeId, request);
        URI location = URI.create("/api/employees/" + employeeId + "/portfolio/projects/" + response.id());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long employeeId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(portfolioService.updateProject(employeeId, id, request));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long employeeId, @PathVariable Long id) {
        portfolioService.deleteProject(employeeId, id);
        return ResponseEntity.noContent().build();
    }

    // Showcase links

    @PostMapping("/links")
    public ResponseEntity<ShowcaseLinkResponse> addLink(
            @PathVariable Long employeeId,
            @Valid @RequestBody CreateShowcaseLinkRequest request) {
        ShowcaseLinkResponse response = portfolioService.addLink(employeeId, request);
        URI location = URI.create("/api/employees/" + employeeId + "/portfolio/links/" + response.id());
        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/links/{id}")
    public ResponseEntity<ShowcaseLinkResponse> updateLink(
            @PathVariable Long employeeId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateShowcaseLinkRequest request) {
        return ResponseEntity.ok(portfolioService.updateLink(employeeId, id, request));
    }

    @DeleteMapping("/links/{id}")
    public ResponseEntity<Void> deleteLink(@PathVariable Long employeeId, @PathVariable Long id) {
        portfolioService.deleteLink(employeeId, id);
        return ResponseEntity.noContent().build();
    }
}
