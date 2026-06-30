package com.psybergate.staff_engagement.portfolio;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.psybergate.staff_engagement.common.exception.GlobalExceptionHandler;
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
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

@ExtendWith(MockitoExtension.class)
class PortfolioControllerTest {

    @Mock
    private PortfolioService portfolioService;

    @InjectMocks
    private PortfolioController portfolioController;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    private static final Long EMPLOYEE_ID = 42L;
    private static final Long EDUCATION_ID = 1L;
    private static final Long PROJECT_ID = 2L;
    private static final Long LINK_ID = 3L;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
        mockMvc = MockMvcBuilders.standaloneSetup(portfolioController)
                .setValidator(new LocalValidatorFactoryBean())
                .setControllerAdvice(new GlobalExceptionHandler(Clock.systemDefaultZone()))
                .build();
    }

    @Test
    void getPortfolioReturnsOkWithBody() throws Exception {
        EducationResponse education = new EducationResponse(EDUCATION_ID, EMPLOYEE_ID, "University",
                "BSc", "CS", 2020, 2023, "desc");
        ProjectResponse project = new ProjectResponse(PROJECT_ID, EMPLOYEE_ID, "Project A",
                "Description", LocalDate.of(2022, 1, 1), LocalDate.of(2023, 1, 1), "https://example.com");
        ShowcaseLinkResponse link = new ShowcaseLinkResponse(LINK_ID, EMPLOYEE_ID, "GitHub",
                "https://github.com/example", 1);
        PortfolioResponse portfolio = new PortfolioResponse(EMPLOYEE_ID,
                List.of(education), List.of(project), List.of(link), List.of());

        when(portfolioService.getPortfolio(EMPLOYEE_ID)).thenReturn(portfolio);

        mockMvc.perform(get("/api/employees/{employeeId}/portfolio", EMPLOYEE_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeId").value(EMPLOYEE_ID))
                .andExpect(jsonPath("$.education[0].id").value(EDUCATION_ID))
                .andExpect(jsonPath("$.projects[0].id").value(PROJECT_ID))
                .andExpect(jsonPath("$.links[0].id").value(LINK_ID));
    }

    @Test
    void addEducationReturnsCreatedWithLocationAndBody() throws Exception {
        CreateEducationRequest request = new CreateEducationRequest("University", "BSc",
                "CS", 2020, 2023, "desc");
        EducationResponse response = new EducationResponse(EDUCATION_ID, EMPLOYEE_ID, "University",
                "BSc", "CS", 2020, 2023, "desc");

        when(portfolioService.addEducation(eq(EMPLOYEE_ID), any(CreateEducationRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/employees/{employeeId}/portfolio/education", EMPLOYEE_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void addEducationReturnsBadRequestWhenYearRangeInvalid() throws Exception {
        CreateEducationRequest request = new CreateEducationRequest("University", "BSc",
                "CS", 2025, 2020, "desc");

        mockMvc.perform(post("/api/employees/{employeeId}/portfolio/education", EMPLOYEE_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void updateEducationReturnsBadRequestWhenYearRangeInvalid() throws Exception {
        UpdateEducationRequest request = new UpdateEducationRequest("University", "BSc",
                "CS", 2025, 2020, "desc");

        mockMvc.perform(put("/api/employees/{employeeId}/portfolio/education/{id}", EMPLOYEE_ID, EDUCATION_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void updateEducationReturnsOkWithBody() throws Exception {
        UpdateEducationRequest request = new UpdateEducationRequest("University", "BSc",
                "CS", 2020, 2023, "desc");
        EducationResponse response = new EducationResponse(EDUCATION_ID, EMPLOYEE_ID, "University",
                "BSc", "CS", 2020, 2023, "desc");

        when(portfolioService.updateEducation(eq(EMPLOYEE_ID), eq(EDUCATION_ID),
                any(UpdateEducationRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/employees/{employeeId}/portfolio/education/{id}", EMPLOYEE_ID, EDUCATION_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(EDUCATION_ID))
                .andExpect(jsonPath("$.qualification").value("BSc"));
    }

    @Test
    void deleteEducationReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/employees/{employeeId}/portfolio/education/{id}", EMPLOYEE_ID, EDUCATION_ID))
                .andExpect(status().isNoContent());

        verify(portfolioService).deleteEducation(EMPLOYEE_ID, EDUCATION_ID);
    }

    @Test
    void addProjectReturnsCreatedWithLocationAndBody() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest("Project A", "Description",
                LocalDate.of(2022, 1, 1), LocalDate.of(2023, 1, 1), "https://example.com");
        ProjectResponse response = new ProjectResponse(PROJECT_ID, EMPLOYEE_ID, "Project A",
                "Description", LocalDate.of(2022, 1, 1), LocalDate.of(2023, 1, 1), "https://example.com");

        when(portfolioService.addProject(eq(EMPLOYEE_ID), any(CreateProjectRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/employees/{employeeId}/portfolio/projects", EMPLOYEE_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location",
                        "/api/employees/" + EMPLOYEE_ID + "/portfolio/projects/" + PROJECT_ID))
                .andExpect(jsonPath("$.id").value(PROJECT_ID))
                .andExpect(jsonPath("$.name").value("Project A"));
    }

    @Test
    void updateProjectReturnsOkWithBody() throws Exception {
        UpdateProjectRequest request = new UpdateProjectRequest("Project A", "Description",
                LocalDate.of(2022, 1, 1), LocalDate.of(2023, 1, 1), "https://example.com");
        ProjectResponse response = new ProjectResponse(PROJECT_ID, EMPLOYEE_ID, "Project A",
                "Description", LocalDate.of(2022, 1, 1), LocalDate.of(2023, 1, 1), "https://example.com");

        when(portfolioService.updateProject(eq(EMPLOYEE_ID), eq(PROJECT_ID), any(UpdateProjectRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/employees/{employeeId}/portfolio/projects/{id}", EMPLOYEE_ID, PROJECT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(PROJECT_ID))
                .andExpect(jsonPath("$.url").value("https://example.com"));
    }

    @Test
    void addProjectReturnsBadRequestWhenDateRangeInvalid() throws Exception {
        CreateProjectRequest request = new CreateProjectRequest("Project A", "Description",
                LocalDate.of(2023, 1, 1), LocalDate.of(2022, 1, 1), "https://example.com");

        mockMvc.perform(post("/api/employees/{employeeId}/portfolio/projects", EMPLOYEE_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void updateProjectReturnsBadRequestWhenDateRangeInvalid() throws Exception {
        UpdateProjectRequest request = new UpdateProjectRequest("Project A", "Description",
                LocalDate.of(2023, 1, 1), LocalDate.of(2022, 1, 1), "https://example.com");

        mockMvc.perform(put("/api/employees/{employeeId}/portfolio/projects/{id}", EMPLOYEE_ID, PROJECT_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void deleteProjectReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/employees/{employeeId}/portfolio/projects/{id}", EMPLOYEE_ID, PROJECT_ID))
                .andExpect(status().isNoContent());

        verify(portfolioService).deleteProject(EMPLOYEE_ID, PROJECT_ID);
    }

    @Test
    void addLinkReturnsCreatedWithLocationAndBody() throws Exception {
        CreateShowcaseLinkRequest request = new CreateShowcaseLinkRequest("GitHub",
                "https://github.com/example", 1);
        ShowcaseLinkResponse response = new ShowcaseLinkResponse(LINK_ID, EMPLOYEE_ID, "GitHub",
                "https://github.com/example", 1);

        when(portfolioService.addLink(eq(EMPLOYEE_ID), any(CreateShowcaseLinkRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/employees/{employeeId}/portfolio/links", EMPLOYEE_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location",
                        "/api/employees/" + EMPLOYEE_ID + "/portfolio/links/" + LINK_ID))
                .andExpect(jsonPath("$.id").value(LINK_ID))
                .andExpect(jsonPath("$.label").value("GitHub"));
    }

    @Test
    void updateLinkReturnsOkWithBody() throws Exception {
        UpdateShowcaseLinkRequest request = new UpdateShowcaseLinkRequest("GitHub",
                "https://github.com/example", 1);
        ShowcaseLinkResponse response = new ShowcaseLinkResponse(LINK_ID, EMPLOYEE_ID, "GitHub",
                "https://github.com/example", 1);

        when(portfolioService.updateLink(eq(EMPLOYEE_ID), eq(LINK_ID), any(UpdateShowcaseLinkRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/employees/{employeeId}/portfolio/links/{id}", EMPLOYEE_ID, LINK_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(LINK_ID))
                .andExpect(jsonPath("$.sortOrder").value(1));
    }

    @Test
    void deleteLinkReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/employees/{employeeId}/portfolio/links/{id}", EMPLOYEE_ID, LINK_ID))
                .andExpect(status().isNoContent());

        verify(portfolioService).deleteLink(EMPLOYEE_ID, LINK_ID);
    }
}
