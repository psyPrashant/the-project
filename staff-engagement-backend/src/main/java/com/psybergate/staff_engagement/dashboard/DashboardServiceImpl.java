package com.psybergate.staff_engagement.dashboard;

import com.psybergate.staff_engagement.dashboard.dto.ActionNeededItemResponse;
import com.psybergate.staff_engagement.dashboard.dto.ActivityItemResponse;
import com.psybergate.staff_engagement.dashboard.dto.DashboardResponse;
import com.psybergate.staff_engagement.dashboard.dto.MeSummaryResponse;
import com.psybergate.staff_engagement.dashboard.dto.SkillCoverageItemResponse;
import com.psybergate.staff_engagement.dashboard.dto.SkillCoverageResponse;
import com.psybergate.staff_engagement.dashboard.dto.WorkforcePulseResponse;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import com.psybergate.staff_engagement.employee.dto.EmployeeProfileResponse;
import com.psybergate.staff_engagement.interaction.InteractionService;
import com.psybergate.staff_engagement.skills.SkillService;
import com.psybergate.staff_engagement.skills.dto.EmployeeSkillResponse;
import com.psybergate.staff_engagement.skills.dto.SkillSummaryResponse;
import com.psybergate.staff_engagement.task.TaskService;
import com.psybergate.staff_engagement.task.TaskStatus;
import com.psybergate.staff_engagement.task.dto.TaskResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final EmployeeService employeeService;
    private final TaskService taskService;
    private final SkillService skillService;
    private final InteractionService interactionService;

    @Override
    public DashboardResponse getDashboard(Employee currentEmployee) {
        List<EmployeeProfileResponse> employees = employeeService.getEmployees(null, false);
        Set<Long> employeeIds = employees.stream()
                .map(EmployeeProfileResponse::id)
                .collect(Collectors.toSet());

        WorkforcePulseResponse pulse = buildPulse(employees);
        List<ActionNeededItemResponse> actionNeeded = buildActionNeeded(employees);
        List<ActivityItemResponse> recentActivity = buildRecentActivity(employees, currentEmployee);
        SkillCoverageResponse skillCoverage = buildSkillCoverage();
        MeSummaryResponse me = buildMe(currentEmployee, employeeIds);

        return new DashboardResponse(pulse, actionNeeded, recentActivity, skillCoverage, me);
    }

    private WorkforcePulseResponse buildPulse(List<EmployeeProfileResponse> employees) {
        long totalEmployees = employees.size();
        List<Long> employeeIds = employees.stream().map(EmployeeProfileResponse::id).toList();
        List<EmployeeSkillResponse> allAssignments = skillService.getAllEmployeeSkillAssignments();
        long employeesWithSkills = employeeIds.isEmpty() ? 0
                : allAssignments.stream()
                        .map(es -> es.employeeId())
                        .filter(employeeIds::contains)
                        .distinct()
                        .count();
        long openTasks = taskService.getAllTasks().stream()
                .filter(t -> t.status() == TaskStatus.OPEN)
                .count();
        LocalDateTime weekAgo = LocalDateTime.now().minus(7, ChronoUnit.DAYS);
        long interactionsThisWeek = employeeIds.isEmpty() ? 0
                : employees.stream()
                        .mapToLong(e -> interactionService.findBySubject(e.id()).stream()
                                .filter(i -> i.date() != null && i.date().atStartOfDay().isAfter(weekAgo))
                                .count())
                        .sum();

        return new WorkforcePulseResponse(totalEmployees, employeesWithSkills, openTasks, interactionsThisWeek);
    }

    private List<ActionNeededItemResponse> buildActionNeeded(List<EmployeeProfileResponse> employees) {
        List<ActionNeededItemResponse> items = new ArrayList<>();
        List<Long> employeeIds = employees.stream().map(EmployeeProfileResponse::id).toList();

        Set<Long> employeesWithSkills = employeeIds.isEmpty() ? Set.of()
                : skillService.getAllEmployeeSkillAssignments().stream()
                        .map(es -> es.employeeId())
                        .filter(employeeIds::contains)
                        .collect(Collectors.toSet());

        for (EmployeeProfileResponse employee : employees) {
            if (!employeesWithSkills.contains(employee.id())) {
                items.add(new ActionNeededItemResponse(employee.id(), fullName(employee), "No skills recorded"));
            }
        }

        LocalDate today = LocalDate.now();
        taskService.getAllTasks().stream()
                .filter(t -> t.status() == TaskStatus.OPEN)
                .filter(t -> t.dueDate() != null && t.dueDate().isBefore(today))
                .filter(t -> employeeIds.contains(t.relatesTo().id()))
                .map(t -> new ActionNeededItemResponse(
                        t.relatesTo().id(),
                        fullName(t.relatesTo()),
                        "Overdue task: " + t.title()))
                .forEach(items::add);

        return items.stream()
                .sorted(Comparator.comparing(ActionNeededItemResponse::employeeName))
                .toList();
    }

    private List<ActivityItemResponse> buildRecentActivity(List<EmployeeProfileResponse> employees, Employee currentEmployee) {
        List<ActivityItemResponse> activities = new ArrayList<>();
        LocalDateTime since = LocalDateTime.now().minus(14, ChronoUnit.DAYS);

        employees.forEach(e -> interactionService.findBySubject(e.id()).stream()
                .filter(i -> i.date() != null && i.date().atStartOfDay().isAfter(since))
                .forEach(i -> activities.add(new ActivityItemResponse(
                        "interaction",
                        fullName(i.author()),
                        i.subject().id(),
                        fullName(i.subject()),
                        "Logged " + i.type() + " interaction",
                        i.date().atStartOfDay()))));

        taskService.getAllTasks().stream()
                .filter(t -> t.createdAt() != null && t.createdAt().isAfter(since))
                .forEach(t -> activities.add(new ActivityItemResponse(
                        "task",
                        fullName(t.createdBy()),
                        t.relatesTo().id(),
                        fullName(t.relatesTo()),
                        "Created task: " + t.title(),
                        t.createdAt())));

        return activities.stream()
                .sorted(Comparator.comparing(ActivityItemResponse::occurredAt).reversed())
                .limit(20)
                .toList();
    }

    private SkillCoverageResponse buildSkillCoverage() {
        List<SkillSummaryResponse> summaries = skillService.browseRegister();
        List<SkillCoverageItemResponse> topSkills = summaries.stream()
                .filter(s -> s.employeeCount() > 0)
                .sorted(Comparator.comparingLong(SkillSummaryResponse::employeeCount).reversed())
                .limit(5)
                .map(s -> new SkillCoverageItemResponse(s.id(), s.name(), s.employeeCount()))
                .toList();
        List<SkillCoverageItemResponse> orphanedSkills = summaries.stream()
                .filter(s -> s.employeeCount() == 0)
                .map(s -> new SkillCoverageItemResponse(s.id(), s.name(), 0L))
                .toList();
        return new SkillCoverageResponse(topSkills, orphanedSkills);
    }

    private MeSummaryResponse buildMe(Employee currentEmployee, Set<Long> allEmployeeIds) {
        long skillCount = skillService.getSkillsForEmployee(currentEmployee.getId()).size();
        long openTaskCount = taskService.getAllTasks().stream()
                .filter(t -> relatesToOrAssigneeIs(t, currentEmployee.getId()))
                .filter(t -> t.status() == TaskStatus.OPEN)
                .count();
        LocalDateTime weekAgo = LocalDateTime.now().minus(7, ChronoUnit.DAYS);
        long recentInteractionCount = interactionService.findBySubject(currentEmployee.getId()).stream()
                .filter(i -> i.date() != null && i.date().atStartOfDay().isAfter(weekAgo))
                .count();

        return new MeSummaryResponse(
                currentEmployee.getId(),
                currentEmployee.getFirstName() + " " + currentEmployee.getLastName(),
                skillCount,
                openTaskCount,
                recentInteractionCount);
    }

    private String fullName(EmployeeProfileResponse employee) {
        return employee.firstName() + " " + employee.lastName();
    }

    private String fullName(com.psybergate.staff_engagement.employee.dto.EmployeeResponse employee) {
        return employee.firstName() + " " + employee.lastName();
    }

    private String fullName(Employee employee) {
        return employee.getFirstName() + " " + employee.getLastName();
    }

    private String employeeName(List<EmployeeProfileResponse> employees, Long id) {
        return employees.stream()
                .filter(e -> e.id().equals(id))
                .findFirst()
                .map(this::fullName)
                .orElse("Unknown");
    }

    private boolean relatesToOrAssigneeIs(TaskResponse task, Long employeeId) {
        return (task.relatesTo() != null && task.relatesTo().id().equals(employeeId))
                || (task.assignee() != null && task.assignee().id().equals(employeeId));
    }
}
