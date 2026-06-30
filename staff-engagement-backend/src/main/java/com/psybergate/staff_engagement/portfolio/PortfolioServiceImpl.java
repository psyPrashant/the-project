package com.psybergate.staff_engagement.portfolio;

import com.psybergate.staff_engagement.employee.EmployeeService;
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
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PortfolioServiceImpl implements PortfolioService {

    private final EmployeeService employeeService;
    private final EducationRepository educationRepository;
    private final ProjectRepository projectRepository;
    private final ShowcaseLinkRepository showcaseLinkRepository;

    @Override
    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolio(Long employeeId) {
        validateEmployeeExists(employeeId);
        return new PortfolioResponse(
                employeeId,
                educationRepository.findByEmployeeIdOrdered(employeeId).stream().map(this::toEducationResponse).toList(),
                projectRepository.findByEmployeeIdOrdered(employeeId).stream().map(this::toProjectResponse).toList(),
                showcaseLinkRepository.findByEmployeeIdOrdered(employeeId).stream().map(this::toShowcaseLinkResponse).toList(),
                List.of());
    }

    @Override
    public EducationResponse addEducation(Long employeeId, CreateEducationRequest request) {
        validateEmployeeExists(employeeId);
        Education education = Education.builder()
                .employeeId(employeeId)
                .institution(request.institution())
                .qualification(request.qualification())
                .fieldOfStudy(request.fieldOfStudy())
                .startYear(request.startYear())
                .endYear(request.endYear())
                .description(request.description())
                .build();
        return toEducationResponse(educationRepository.save(education));
    }

    @Override
    public EducationResponse updateEducation(Long employeeId, Long educationId, UpdateEducationRequest request) {
        validateEmployeeExists(employeeId);
        Education education = educationRepository.findById(educationId)
                .filter(e -> e.getEmployeeId().equals(employeeId))
                .orElseThrow(() -> new EntityNotFoundException("Education not found: " + educationId));
        education.setInstitution(request.institution());
        education.setQualification(request.qualification());
        education.setFieldOfStudy(request.fieldOfStudy());
        education.setStartYear(request.startYear());
        education.setEndYear(request.endYear());
        education.setDescription(request.description());
        return toEducationResponse(educationRepository.save(education));
    }

    @Override
    public void deleteEducation(Long employeeId, Long educationId) {
        validateEmployeeExists(employeeId);
        Education education = educationRepository.findById(educationId)
                .filter(e -> e.getEmployeeId().equals(employeeId))
                .orElseThrow(() -> new EntityNotFoundException("Education not found: " + educationId));
        educationRepository.delete(education);
    }

    @Override
    public ProjectResponse addProject(Long employeeId, CreateProjectRequest request) {
        validateEmployeeExists(employeeId);
        Project project = Project.builder()
                .employeeId(employeeId)
                .name(request.name())
                .description(request.description())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .url(request.url())
                .build();
        return toProjectResponse(projectRepository.save(project));
    }

    @Override
    public ProjectResponse updateProject(Long employeeId, Long projectId, UpdateProjectRequest request) {
        validateEmployeeExists(employeeId);
        Project project = projectRepository.findById(projectId)
                .filter(p -> p.getEmployeeId().equals(employeeId))
                .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
        project.setName(request.name());
        project.setDescription(request.description());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        project.setUrl(request.url());
        return toProjectResponse(projectRepository.save(project));
    }

    @Override
    public void deleteProject(Long employeeId, Long projectId) {
        validateEmployeeExists(employeeId);
        Project project = projectRepository.findById(projectId)
                .filter(p -> p.getEmployeeId().equals(employeeId))
                .orElseThrow(() -> new EntityNotFoundException("Project not found: " + projectId));
        projectRepository.delete(project);
    }

    @Override
    public ShowcaseLinkResponse addLink(Long employeeId, CreateShowcaseLinkRequest request) {
        validateEmployeeExists(employeeId);
        ShowcaseLink link = ShowcaseLink.builder()
                .employeeId(employeeId)
                .label(request.label())
                .url(request.url())
                .sortOrder(request.sortOrder())
                .build();
        return toShowcaseLinkResponse(showcaseLinkRepository.save(link));
    }

    @Override
    public ShowcaseLinkResponse updateLink(Long employeeId, Long linkId, UpdateShowcaseLinkRequest request) {
        validateEmployeeExists(employeeId);
        ShowcaseLink link = showcaseLinkRepository.findById(linkId)
                .filter(l -> l.getEmployeeId().equals(employeeId))
                .orElseThrow(() -> new EntityNotFoundException("Showcase link not found: " + linkId));
        link.setLabel(request.label());
        link.setUrl(request.url());
        link.setSortOrder(request.sortOrder());
        return toShowcaseLinkResponse(showcaseLinkRepository.save(link));
    }

    @Override
    public void deleteLink(Long employeeId, Long linkId) {
        validateEmployeeExists(employeeId);
        ShowcaseLink link = showcaseLinkRepository.findById(linkId)
                .filter(l -> l.getEmployeeId().equals(employeeId))
                .orElseThrow(() -> new EntityNotFoundException("Showcase link not found: " + linkId));
        showcaseLinkRepository.delete(link);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean projectExists(Long projectId) {
        return projectRepository.existsById(projectId);
    }

    private void validateEmployeeExists(Long employeeId) {
        employeeService.findById(employeeId);
    }

    private EducationResponse toEducationResponse(Education education) {
        return new EducationResponse(
                education.getId(),
                education.getEmployeeId(),
                education.getInstitution(),
                education.getQualification(),
                education.getFieldOfStudy(),
                education.getStartYear(),
                education.getEndYear(),
                education.getDescription());
    }

    private ProjectResponse toProjectResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getEmployeeId(),
                project.getName(),
                project.getDescription(),
                project.getStartDate(),
                project.getEndDate(),
                project.getUrl());
    }

    private ShowcaseLinkResponse toShowcaseLinkResponse(ShowcaseLink link) {
        return new ShowcaseLinkResponse(
                link.getId(),
                link.getEmployeeId(),
                link.getLabel(),
                link.getUrl(),
                link.getSortOrder());
    }
}
