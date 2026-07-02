package com.psybergate.staff_engagement.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import com.psybergate.staff_engagement.dashboard.dto.ActionNeededItemResponse;
import com.psybergate.staff_engagement.dashboard.dto.ActivityItemResponse;
import com.psybergate.staff_engagement.dashboard.dto.DashboardResponse;
import com.psybergate.staff_engagement.employee.Employee;
import com.psybergate.staff_engagement.employee.EmployeeService;
import com.psybergate.staff_engagement.employee.dto.EmployeeProfileResponse;
import com.psybergate.staff_engagement.employee.dto.EmployeeResponse;
import com.psybergate.staff_engagement.interaction.InteractionType;
import com.psybergate.staff_engagement.interaction.InteractionService;
import com.psybergate.staff_engagement.interaction.dto.InteractionResponseDto;
import com.psybergate.staff_engagement.skills.SkillService;
import com.psybergate.staff_engagement.skills.dto.EmployeeSkillResponse;
import com.psybergate.staff_engagement.skills.dto.SkillSummaryResponse;
import com.psybergate.staff_engagement.task.TaskService;
import com.psybergate.staff_engagement.task.TaskStatus;
import com.psybergate.staff_engagement.task.dto.TaskResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for {@link DashboardServiceImpl} — the dashboard aggregates data from four other
 * modules (employee, task, skill, interaction) purely through their service interfaces, so it is
 * exercised here entirely with mocks. Assertions pin exact counts, ordering and date-window
 * boundaries so the arithmetic and filtering survive mutation testing.
 */
@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock private EmployeeService employeeService;
    @Mock private TaskService taskService;
    @Mock private SkillService skillService;
    @Mock private InteractionService interactionService;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    // Alice is both the current (authenticated) employee and part of the workforce.
    private final Employee currentAlice = Employee.builder()
            .id(1L).email("alice@x.com").firstName("Alice").lastName("Anderson").build();

    private final EmployeeProfileResponse alice = profile(1L, "Alice", "Anderson");
    private final EmployeeProfileResponse bob = profile(2L, "Bob", "Brown");
    private final EmployeeProfileResponse carol = profile(3L, "Carol", "Clark");

    private final EmployeeResponse aliceRef = ref(1L, "Alice", "Anderson");
    private final EmployeeResponse bobRef = ref(2L, "Bob", "Brown");
    private final EmployeeResponse carolRef = ref(3L, "Carol", "Clark");

    private final LocalDate recentDate = LocalDate.now().minusDays(1);   // inside week and 14-day windows
    private final LocalDate staleDate = LocalDate.now().minusDays(30);   // outside both windows
    private final LocalDateTime recentTs = LocalDateTime.now().minusDays(1);
    private final LocalDateTime staleTs = LocalDateTime.now().minusDays(30);

    /**
     * A complete, internally-consistent workforce scenario. Stubs are lenient so individual tests
     * can override just the slice they care about without tripping strict-stubbing checks.
     */
    @BeforeEach
    void setUp() {
        lenient().when(employeeService.getEmployees(null, false))
                .thenReturn(List.of(alice, bob, carol));

        // Alice has two skills (distinct must collapse to one person); Bob one; Carol none.
        // The employee id 99 assignment must be filtered out (not in the workforce list).
        lenient().when(skillService.getAllEmployeeSkillAssignments()).thenReturn(List.of(
                assignment(10L, 1L, 100L, "Java"),
                assignment(11L, 1L, 101L, "Spring"),
                assignment(12L, 2L, 100L, "Java"),
                assignment(13L, 99L, 100L, "Java")));

        lenient().when(skillService.getSkillsForEmployee(1L)).thenReturn(List.of(
                assignment(10L, 1L, 100L, "Java"),
                assignment(11L, 1L, 101L, "Spring")));

        lenient().when(skillService.browseRegister()).thenReturn(List.of(
                skillSummary(100L, "Java", 5L),
                skillSummary(101L, "Spring", 3L),
                skillSummary(102L, "Docker", 0L),
                skillSummary(103L, "Kotlin", 0L)));

        // T1 overdue open task relating to Alice; T2 done; T3 open, due in the future, assigned to Alice.
        lenient().when(taskService.getAllTasks()).thenReturn(List.of(
                task(501L, "Fix login", TaskStatus.OPEN, aliceRef, bobRef,
                        LocalDate.now().minusDays(2), null, recentTs),
                task(502L, "Ship release", TaskStatus.DONE, bobRef, aliceRef,
                        null, null, recentTs),
                task(503L, "Plan sprint", TaskStatus.OPEN, carolRef, aliceRef,
                        LocalDate.now().plusDays(5), aliceRef, staleTs)));

        lenient().when(interactionService.findBySubject(1L)).thenReturn(List.of(
                interaction(1L, bobRef, aliceRef, InteractionType.CALL, recentDate),
                interaction(2L, carolRef, aliceRef, InteractionType.NOTE, staleDate)));
        lenient().when(interactionService.findBySubject(2L)).thenReturn(List.of(
                interaction(3L, aliceRef, bobRef, InteractionType.MEETING, recentDate)));
        lenient().when(interactionService.findBySubject(3L)).thenReturn(List.of());
    }

    @Test
    void getDashboard_buildsWorkforcePulseFromAllModules() {
        var pulse = dashboardService.getDashboard(currentAlice).workforcePulse();

        assertThat(pulse.totalEmployees()).isEqualTo(3);
        assertThat(pulse.employeesWithSkills()).isEqualTo(2);       // Alice + Bob, distinct; id 99 excluded
        assertThat(pulse.openTasks()).isEqualTo(2);                 // T1 + T3, not the DONE T2
        assertThat(pulse.interactionsThisWeek()).isEqualTo(2);      // Alice CALL + Bob MEETING (stale excluded)
    }

    @Test
    void getDashboard_actionNeededFlagsMissingSkillsAndOverdueTasks_sortedByName() {
        List<ActionNeededItemResponse> items = dashboardService.getDashboard(currentAlice).actionNeeded();

        assertThat(items).hasSize(2);
        // Sorted alphabetically by employee name: "Alice Anderson" before "Carol Clark".
        assertThat(items.get(0).employeeName()).isEqualTo("Alice Anderson");
        assertThat(items.get(0).reason()).isEqualTo("Overdue task: Fix login");
        assertThat(items.get(1).employeeName()).isEqualTo("Carol Clark");
        assertThat(items.get(1).reason()).isEqualTo("No skills recorded");
    }

    @Test
    void getDashboard_skillCoverageSplitsPopulatedAndOrphanedSkills() {
        var coverage = dashboardService.getDashboard(currentAlice).skillCoverage();

        assertThat(coverage.topSkills())
                .extracting(s -> s.skillName())
                .containsExactly("Java", "Spring");               // populated, sorted by count desc
        assertThat(coverage.topSkills().get(0).employeeCount()).isEqualTo(5);
        assertThat(coverage.orphanedSkills())
                .extracting(s -> s.skillName())
                .containsExactly("Docker", "Kotlin");             // employeeCount == 0
    }

    @Test
    void getDashboard_meSummarisesTheCurrentEmployee() {
        var me = dashboardService.getDashboard(currentAlice).me();

        assertThat(me.employeeId()).isEqualTo(1L);
        assertThat(me.employeeName()).isEqualTo("Alice Anderson");
        assertThat(me.skillCount()).isEqualTo(2);
        assertThat(me.openTaskCount()).isEqualTo(2);              // T1 relatesTo=Alice, T3 assignee=Alice
        assertThat(me.recentInteractionCount()).isEqualTo(1);    // CALL this week; NOTE is stale
    }

    @Test
    void getDashboard_recentActivityContainsInteractionsAndTasksWithinWindow() {
        List<ActivityItemResponse> activity = dashboardService.getDashboard(currentAlice).recentActivity();

        // Two interactions (CALL, MEETING) + two tasks created recently; the stale ones drop out.
        assertThat(activity).hasSize(4);
        assertThat(activity).extracting(ActivityItemResponse::description)
                .containsExactlyInAnyOrder(
                        "Logged CALL interaction",
                        "Logged MEETING interaction",
                        "Created task: Fix login",
                        "Created task: Ship release");
    }

    @Test
    void getDashboard_emptyWorkforce_yieldsZeroPulseButStillSummarisesMe() {
        when(employeeService.getEmployees(null, false)).thenReturn(List.of());
        when(taskService.getAllTasks()).thenReturn(List.of());
        when(skillService.getSkillsForEmployee(1L)).thenReturn(List.of());
        when(interactionService.findBySubject(1L)).thenReturn(List.of());

        DashboardResponse dashboard = dashboardService.getDashboard(currentAlice);

        assertThat(dashboard.workforcePulse().totalEmployees()).isZero();
        assertThat(dashboard.workforcePulse().employeesWithSkills()).isZero();
        assertThat(dashboard.workforcePulse().interactionsThisWeek()).isZero();
        assertThat(dashboard.actionNeeded()).isEmpty();
        assertThat(dashboard.recentActivity()).isEmpty();
        assertThat(dashboard.me().employeeId()).isEqualTo(1L);
        assertThat(dashboard.me().openTaskCount()).isZero();
    }

    @Test
    void getDashboard_recentActivityIsNewestFirstAndCappedAtTwenty() {
        // No workforce → no interaction activity, so tasks are the only source and ordering is easy to pin.
        when(employeeService.getEmployees(null, false)).thenReturn(List.of());
        when(skillService.getSkillsForEmployee(1L)).thenReturn(List.of());
        when(interactionService.findBySubject(1L)).thenReturn(List.of());

        List<TaskResponse> manyTasks = new ArrayList<>();
        LocalDateTime base = LocalDateTime.now().minusHours(30);
        for (int i = 0; i < 25; i++) {
            // Increasing timestamps: task 24 is the newest.
            manyTasks.add(task(600L + i, "Task " + i, TaskStatus.OPEN, aliceRef, aliceRef,
                    null, null, base.plusMinutes(i)));
        }
        when(taskService.getAllTasks()).thenReturn(manyTasks);

        List<ActivityItemResponse> activity = dashboardService.getDashboard(currentAlice).recentActivity();

        assertThat(activity).hasSize(20);                                   // limit(20)
        assertThat(activity.get(0).description()).isEqualTo("Created task: Task 24");   // newest first
        assertThat(activity).isSortedAccordingTo(
                java.util.Comparator.comparing(ActivityItemResponse::occurredAt).reversed());
    }

    // --- fixture helpers -------------------------------------------------

    private EmployeeProfileResponse profile(long id, String first, String last) {
        return new EmployeeProfileResponse(id, first, last, first.toLowerCase() + "@x.com",
                "Engineer", "Engineering", null, false);
    }

    private EmployeeResponse ref(long id, String first, String last) {
        return new EmployeeResponse(id, first.toLowerCase() + "@x.com", first, last);
    }

    private EmployeeSkillResponse assignment(long id, long employeeId, long skillId, String name) {
        return new EmployeeSkillResponse(id, employeeId, skillId, name, 3, 0L);
    }

    private SkillSummaryResponse skillSummary(long id, String name, long employeeCount) {
        return new SkillSummaryResponse(id, name, employeeCount);
    }

    private TaskResponse task(long id, String title, TaskStatus status, EmployeeResponse relatesTo,
            EmployeeResponse createdBy, LocalDate dueDate, EmployeeResponse assignee, LocalDateTime createdAt) {
        return new TaskResponse(id, title, null, status, relatesTo, createdBy, null, dueDate,
                assignee, createdAt, createdAt);
    }

    private InteractionResponseDto interaction(long id, EmployeeResponse author, EmployeeResponse subject,
            InteractionType type, LocalDate date) {
        return new InteractionResponseDto(id, author, subject, "note", type, date);
    }
}
