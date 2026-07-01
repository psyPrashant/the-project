package com.psybergate.staff_engagement.portfolio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.psybergate.staff_engagement.employee.Employee;
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
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceImplTest {

    @Mock
    private EmployeeService employeeService;

    @Mock
    private EducationRepository educationRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ShowcaseLinkRepository showcaseLinkRepository;

    @InjectMocks
    private PortfolioServiceImpl portfolioService;

    private static final Long EMPLOYEE_ID = 1L;
    private static final Long UNKNOWN_EMPLOYEE_ID = 99L;

    // getPortfolio

    @Test
    void getPortfolio_existingEmployee_returnsAggregatedResponse() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        when(educationRepository.findByEmployeeIdOrdered(EMPLOYEE_ID)).thenReturn(List.of(
                Education.builder().id(1L).employeeId(EMPLOYEE_ID).institution("Uni").qualification("BSc").build()));
        when(projectRepository.findByEmployeeIdOrdered(EMPLOYEE_ID)).thenReturn(List.of(
                Project.builder().id(2L).employeeId(EMPLOYEE_ID).name("Project").build()));
        when(showcaseLinkRepository.findByEmployeeIdOrdered(EMPLOYEE_ID)).thenReturn(List.of(
                ShowcaseLink.builder().id(3L).employeeId(EMPLOYEE_ID).label("GitHub").url("https://github.com").build()));
        PortfolioResponse response = portfolioService.getPortfolio(EMPLOYEE_ID);

        assertThat(response.employeeId()).isEqualTo(EMPLOYEE_ID);
        assertThat(response.education()).hasSize(1);
        assertThat(response.projects()).hasSize(1);
        assertThat(response.links()).hasSize(1);
        assertThat(response.skills()).isEmpty();
    }

    @Test
    void getPortfolio_unknownEmployee_throwsEntityNotFoundException() {
        when(employeeService.findById(UNKNOWN_EMPLOYEE_ID))
                .thenThrow(new EntityNotFoundException("Employee not found"));

        assertThatThrownBy(() -> portfolioService.getPortfolio(UNKNOWN_EMPLOYEE_ID))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // Education

    @Test
    void addEducation_happyPath_returnsMappedResponse() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        Education saved = Education.builder()
                .id(1L)
                .employeeId(EMPLOYEE_ID)
                .institution("Uni")
                .qualification("BSc")
                .build();
        when(educationRepository.save(any())).thenReturn(saved);

        EducationResponse response = portfolioService.addEducation(EMPLOYEE_ID,
                new CreateEducationRequest("Uni", "BSc", null, null, null, null));

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.institution()).isEqualTo("Uni");
        assertThat(response.qualification()).isEqualTo("BSc");
    }

    @Test
    void updateEducation_happyPath_persistsAndReturnsUpdated() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        Education existing = Education.builder()
                .id(1L).employeeId(EMPLOYEE_ID).institution("Old").qualification("Diploma").build();
        when(educationRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(educationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EducationResponse response = portfolioService.updateEducation(EMPLOYEE_ID, 1L,
                new UpdateEducationRequest("New", "MSc", null, null, null, null));

        assertThat(response.institution()).isEqualTo("New");
        assertThat(response.qualification()).isEqualTo("MSc");
        verify(educationRepository).save(existing);
    }

    @Test
    void updateEducation_wrongEmployee_throwsEntityNotFoundException() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        Education other = Education.builder().id(1L).employeeId(2L).build();
        when(educationRepository.findById(1L)).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> portfolioService.updateEducation(EMPLOYEE_ID, 1L,
                new UpdateEducationRequest("Uni", "BSc", null, null, null, null)))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void deleteEducation_happyPath_deletesRecord() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        Education existing = Education.builder().id(1L).employeeId(EMPLOYEE_ID).build();
        when(educationRepository.findById(1L)).thenReturn(Optional.of(existing));

        portfolioService.deleteEducation(EMPLOYEE_ID, 1L);

        verify(educationRepository).delete(existing);
    }

    @Test
    void deleteEducation_wrongEmployee_throwsEntityNotFoundException() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        Education other = Education.builder().id(1L).employeeId(2L).build();
        when(educationRepository.findById(1L)).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> portfolioService.deleteEducation(EMPLOYEE_ID, 1L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void updateEducation_persistsAllOptionalFields() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        Education existing = Education.builder()
                .id(1L).employeeId(EMPLOYEE_ID).institution("Old").qualification("Diploma").build();
        when(educationRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(educationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EducationResponse response = portfolioService.updateEducation(EMPLOYEE_ID, 1L,
                new UpdateEducationRequest("New", "MSc", "Software Engineering", 2016, 2020, "Honours"));

        assertThat(response.institution()).isEqualTo("New");
        assertThat(response.qualification()).isEqualTo("MSc");
        assertThat(response.fieldOfStudy()).isEqualTo("Software Engineering");
        assertThat(response.startYear()).isEqualTo(2016);
        assertThat(response.endYear()).isEqualTo(2020);
        assertThat(response.description()).isEqualTo("Honours");
        verify(educationRepository).save(existing);
    }

    // Projects

    @Test
    void addProject_happyPath_returnsMappedResponse() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        Project saved = Project.builder().id(2L).employeeId(EMPLOYEE_ID).name("Project").build();
        when(projectRepository.save(any())).thenReturn(saved);

        ProjectResponse response = portfolioService.addProject(EMPLOYEE_ID,
                new CreateProjectRequest("Project", null, null, null, null));

        assertThat(response.id()).isEqualTo(2L);
        assertThat(response.name()).isEqualTo("Project");
    }

    @Test
    void updateProject_happyPath_persistsAndReturnsUpdated() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        Project existing = Project.builder().id(2L).employeeId(EMPLOYEE_ID).name("Old").build();
        when(projectRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(projectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProjectResponse response = portfolioService.updateProject(EMPLOYEE_ID, 2L,
                new UpdateProjectRequest("New", null, LocalDate.of(2026, 1, 1), null, null));

        assertThat(response.name()).isEqualTo("New");
        assertThat(response.startDate()).isEqualTo(LocalDate.of(2026, 1, 1));
        verify(projectRepository).save(existing);
    }

    @Test
    void deleteProject_happyPath_deletesRecord() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        Project existing = Project.builder().id(2L).employeeId(EMPLOYEE_ID).build();
        when(projectRepository.findById(2L)).thenReturn(Optional.of(existing));

        portfolioService.deleteProject(EMPLOYEE_ID, 2L);

        verify(projectRepository).delete(existing);
    }

    @Test
    void updateProject_wrongEmployee_throwsEntityNotFoundException() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        Project other = Project.builder().id(2L).employeeId(2L).build();
        when(projectRepository.findById(2L)).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> portfolioService.updateProject(EMPLOYEE_ID, 2L,
                new UpdateProjectRequest("New", null, null, null, null)))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void deleteProject_wrongEmployee_throwsEntityNotFoundException() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        Project other = Project.builder().id(2L).employeeId(2L).build();
        when(projectRepository.findById(2L)).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> portfolioService.deleteProject(EMPLOYEE_ID, 2L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void updateProject_persistsAllOptionalFields() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        Project existing = Project.builder().id(2L).employeeId(EMPLOYEE_ID).name("Old").build();
        when(projectRepository.findById(2L)).thenReturn(Optional.of(existing));
        when(projectRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ProjectResponse response = portfolioService.updateProject(EMPLOYEE_ID, 2L,
                new UpdateProjectRequest("New", "Desc", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1), "https://example.com"));

        assertThat(response.name()).isEqualTo("New");
        assertThat(response.description()).isEqualTo("Desc");
        assertThat(response.startDate()).isEqualTo(LocalDate.of(2026, 1, 1));
        assertThat(response.endDate()).isEqualTo(LocalDate.of(2026, 2, 1));
        assertThat(response.url()).isEqualTo("https://example.com");
        verify(projectRepository).save(existing);
    }

    // Showcase links

    @Test
    void addLink_happyPath_returnsMappedResponse() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        ShowcaseLink saved = ShowcaseLink.builder().id(3L).employeeId(EMPLOYEE_ID).label("GitHub").url("https://github.com").build();
        when(showcaseLinkRepository.save(any())).thenReturn(saved);

        ShowcaseLinkResponse response = portfolioService.addLink(EMPLOYEE_ID,
                new CreateShowcaseLinkRequest("GitHub", "https://github.com", 1));

        assertThat(response.id()).isEqualTo(3L);
        assertThat(response.label()).isEqualTo("GitHub");
    }

    @Test
    void updateLink_happyPath_persistsAndReturnsUpdated() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        ShowcaseLink existing = ShowcaseLink.builder().id(3L).employeeId(EMPLOYEE_ID).label("Old").url("https://old.com").build();
        when(showcaseLinkRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(showcaseLinkRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ShowcaseLinkResponse response = portfolioService.updateLink(EMPLOYEE_ID, 3L,
                new UpdateShowcaseLinkRequest("New", "https://new.com", 2));

        assertThat(response.label()).isEqualTo("New");
        assertThat(response.url()).isEqualTo("https://new.com");
        assertThat(response.sortOrder()).isEqualTo(2);
        verify(showcaseLinkRepository).save(existing);
    }

    @Test
    void deleteLink_happyPath_deletesRecord() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        ShowcaseLink existing = ShowcaseLink.builder().id(3L).employeeId(EMPLOYEE_ID).build();
        when(showcaseLinkRepository.findById(3L)).thenReturn(Optional.of(existing));

        portfolioService.deleteLink(EMPLOYEE_ID, 3L);

        verify(showcaseLinkRepository).delete(existing);
    }

    @Test
    void updateLink_wrongEmployee_throwsEntityNotFoundException() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        ShowcaseLink other = ShowcaseLink.builder().id(3L).employeeId(2L).build();
        when(showcaseLinkRepository.findById(3L)).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> portfolioService.updateLink(EMPLOYEE_ID, 3L,
                new UpdateShowcaseLinkRequest("New", "https://new.com", 2)))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void deleteLink_wrongEmployee_throwsEntityNotFoundException() {
        when(employeeService.findById(EMPLOYEE_ID)).thenReturn(Employee.builder().id(EMPLOYEE_ID).build());
        ShowcaseLink other = ShowcaseLink.builder().id(3L).employeeId(2L).build();
        when(showcaseLinkRepository.findById(3L)).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> portfolioService.deleteLink(EMPLOYEE_ID, 3L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
