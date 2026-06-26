package com.psybergate.staff_engagement.seed;

import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeRepository;
import com.psybergate.staff_engagement.interaction.Interaction;
import com.psybergate.staff_engagement.interaction.InteractionRepository;
import com.psybergate.staff_engagement.interaction.InteractionType;
import com.psybergate.staff_engagement.portfolio.Portfolio;
import com.psybergate.staff_engagement.portfolio.PortfolioRepository;
import com.psybergate.staff_engagement.task.Task;
import com.psybergate.staff_engagement.task.TaskRepository;
import com.psybergate.staff_engagement.task.TaskStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DataSeedService {

    private final EmployeeRepository employeeRepository;
    private final InteractionRepository interactionRepository;
    private final TaskRepository taskRepository;
    private final PortfolioRepository portfolioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public SeedResult seed() {
        List<Employee> employees = seedEmployees();
        List<Interaction> interactions = seedInteractions(employees);
        List<Task> tasks = seedTasks(employees, interactions);
        List<Portfolio> portfolios = seedPortfolios(employees);
        return new SeedResult(employees.size(), interactions.size(), tasks.size(), portfolios.size());
    }

    private List<Employee> seedEmployees() {
        String hash = passwordEncoder.encode("password123");
        return List.of(
            upsert("admin@psybergate.com",    "Admin",  "User",   "Engineering Manager", "Engineering", hash),
            upsert("jane.doe@psybergate.com", "Jane",   "Doe",    "Senior Developer",    "Engineering", hash),
            upsert("john.smith@psybergate.com","John",  "Smith",  "Junior Developer",    "Engineering", hash),
            upsert("sarah.jones@psybergate.com","Sarah","Jones",  "UX Designer",         "Product",     hash),
            upsert("mike.brown@psybergate.com","Mike",  "Brown",  "QA Engineer",         "Quality",     hash)
        );
    }

    private Employee upsert(String email, String firstName, String lastName,
                            String jobTitle, String department, String passwordHash) {
        return employeeRepository.findByEmail(email).orElseGet(() ->
            employeeRepository.save(Employee.builder()
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .jobTitle(jobTitle)
                .department(department)
                .passwordHash(passwordHash)
                .archived(false)
                .build()));
    }

    private List<Interaction> seedInteractions(List<Employee> e) {
        if (interactionRepository.count() > 0) {
            return interactionRepository.findAll();
        }
        Employee admin = e.get(0), jane = e.get(1), john = e.get(2), sarah = e.get(3), mike = e.get(4);
        return interactionRepository.saveAll(List.of(
            interaction(jane,  admin, InteractionType.ONE_ON_ONE,
                "Quarterly check-in. Jane is progressing well on the auth module. Discussed career goals — wants to move into tech lead role within 18 months.",
                LocalDate.now().minusDays(14)),
            interaction(john,  jane,  InteractionType.PERFORMANCE_REVIEW,
                "Mid-year review. John is solid on backend but needs to improve unit test coverage. Set a target of 80% coverage by end of quarter.",
                LocalDate.now().minusDays(10)),
            interaction(john,  admin, InteractionType.TRAINING,
                "Completed Spring Boot advanced workshop. John demonstrated good grasp of transaction management and JPA lazy-loading pitfalls.",
                LocalDate.now().minusDays(7)),
            interaction(sarah, admin, InteractionType.CHECK_IN,
                "Sarah flagged that design handoffs are taking too long due to unclear requirements. Will introduce a brief design-review step before sprint planning.",
                LocalDate.now().minusDays(5)),
            interaction(mike,  jane,  InteractionType.FEEDBACK,
                "Mike raised a concern about the lack of integration tests on the employee module. Agreed to pair on writing IT classes next sprint.",
                LocalDate.now().minusDays(3))
        ));
    }

    private Interaction interaction(Employee subject, Employee loggedBy,
                                    InteractionType type, String notes, LocalDate date) {
        return Interaction.builder()
            .subject(subject)
            .loggedBy(loggedBy)
            .type(type)
            .notes(notes)
            .interactionDate(date)
            .build();
    }

    private List<Task> seedTasks(List<Employee> e, List<Interaction> interactions) {
        if (taskRepository.count() > 0) {
            return taskRepository.findAll();
        }
        Employee admin = e.get(0), jane = e.get(1), john = e.get(2), sarah = e.get(3), mike = e.get(4);
        Interaction reviewInteraction    = interactions.get(1);
        Interaction checkInInteraction   = interactions.get(3);
        Interaction feedbackInteraction  = interactions.get(4);
        return taskRepository.saveAll(List.of(
            task("Increase unit test coverage to 80% on the employee module",
                john,  jane,  reviewInteraction,   TaskStatus.IN_PROGRESS, LocalDate.now().plusDays(14)),
            task("Complete Spring Security integration for the task module",
                john,  admin, null,                TaskStatus.OPEN,        LocalDate.now().plusDays(21)),
            task("Introduce a design-review step into the sprint planning ceremony",
                admin, admin, checkInInteraction,  TaskStatus.OPEN,        LocalDate.now().plusDays(7)),
            task("Write integration test suite for employee CRUD endpoints",
                mike,  jane,  feedbackInteraction, TaskStatus.OPEN,        LocalDate.now().plusDays(10)),
            task("Document API endpoints for the interaction module in Confluence",
                sarah, admin, null,                TaskStatus.OPEN,        LocalDate.now().plusDays(30)),
            task("Set up Playwright smoke tests for login and employee list flows",
                mike,  admin, null,                TaskStatus.DONE,        LocalDate.now().minusDays(2))
        ));
    }

    private Task task(String description, Employee relatesTo, Employee createdBy,
                      Interaction fromInteraction, TaskStatus status, LocalDate dueDate) {
        return Task.builder()
            .description(description)
            .relatesTo(relatesTo)
            .createdBy(createdBy)
            .fromInteraction(fromInteraction)
            .status(status)
            .dueDate(dueDate)
            .build();
    }

    private List<Portfolio> seedPortfolios(List<Employee> e) {
        if (portfolioRepository.count() > 0) {
            return portfolioRepository.findAll();
        }
        Employee jane = e.get(1), john = e.get(2), sarah = e.get(3), mike = e.get(4);
        return portfolioRepository.saveAll(List.of(
            portfolio(jane,  "Staff Engagement Platform",    "Tech Lead",
                "Led backend architecture for the staff engagement platform. Implemented modular monolith structure with Spring Boot 3.5.",
                LocalDate.of(2026, 1, 1), null),
            portfolio(jane,  "HR Automation Suite",          "Senior Developer",
                "Built the leave management and payroll integration modules using Java 17 and Kafka.",
                LocalDate.of(2024, 6, 1), LocalDate.of(2025, 12, 31)),
            portfolio(john,  "Staff Engagement Platform",    "Developer",
                "Implemented employee CRUD APIs and Spring Security JWT authentication.",
                LocalDate.of(2026, 2, 1), null),
            portfolio(john,  "Internal Analytics Dashboard", "Junior Developer",
                "Developed REST endpoints for reporting metrics consumed by the React frontend.",
                LocalDate.of(2025, 3, 1), LocalDate.of(2025, 11, 30)),
            portfolio(sarah, "Staff Engagement Platform",    "UX Designer",
                "Designed the component library and user flows for the Angular SPA.",
                LocalDate.of(2026, 1, 1), null),
            portfolio(mike,  "Staff Engagement Platform",    "QA Engineer",
                "Owns the Playwright e2e test suite and integration test strategy.",
                LocalDate.of(2026, 2, 1), null),
            portfolio(mike,  "Legacy Migration Project",     "QA Engineer",
                "Led test automation migration from manual scripts to Selenium WebDriver.",
                LocalDate.of(2024, 9, 1), LocalDate.of(2025, 8, 31))
        ));
    }

    private Portfolio portfolio(Employee employee, String projectName, String role,
                                String description, LocalDate startDate, LocalDate endDate) {
        return Portfolio.builder()
            .employee(employee)
            .projectName(projectName)
            .role(role)
            .description(description)
            .startDate(startDate)
            .endDate(endDate)
            .build();
    }
}
