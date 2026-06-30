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

/**
 * Module boundary for the portfolio module.
 *
 * <p>Cross-module callers (notably the future skills module) depend on this interface, never on
 * the portfolio repositories, keeping the modular monolith splittable.
 */
public interface PortfolioService {

    PortfolioResponse getPortfolio(Long employeeId);

    EducationResponse addEducation(Long employeeId, CreateEducationRequest request);

    EducationResponse updateEducation(Long employeeId, Long educationId, UpdateEducationRequest request);

    void deleteEducation(Long employeeId, Long educationId);

    ProjectResponse addProject(Long employeeId, CreateProjectRequest request);

    ProjectResponse updateProject(Long employeeId, Long projectId, UpdateProjectRequest request);

    void deleteProject(Long employeeId, Long projectId);

    ShowcaseLinkResponse addLink(Long employeeId, CreateShowcaseLinkRequest request);

    ShowcaseLinkResponse updateLink(Long employeeId, Long linkId, UpdateShowcaseLinkRequest request);

    void deleteLink(Long employeeId, Long linkId);

    boolean projectExists(Long projectId);
}
