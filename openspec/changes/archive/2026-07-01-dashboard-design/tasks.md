## TSP-53 Dashboard Implementation Tasks

1. **Backend: create dashboard module skeleton**
   - Create `dashboard` package under `com.psybergate.staff_engagement.dashboard`.
   - Add `DashboardController` with `GET /api/dashboard`.

2. **Backend: define dashboard response DTOs**
   - `DashboardResponse`, `WorkforcePulse`, `ActionNeededItem`, `ActivityItem`, `SkillCoverage`, `SkillCoverageItem`, `MeSummary`.

3. **Backend: implement dashboard aggregation service**
   - `DashboardService` interface + `DashboardServiceImpl`.
   - Inject `EmployeeService`, `SkillService`, `TaskService`, `InteractionService`.
   - Build workforce counts, action-needed list, recent activity, skill coverage, and me summary.

4. **Backend: unit tests**
   - Add `DashboardServiceTest` mocking domain services and asserting aggregation logic.
   - Add `DashboardControllerTest` for endpoint wiring.

5. **Frontend: create dashboard models and service**
   - `dashboard.models.ts` matching backend response shape.
   - `dashboard.service.ts` calling `GET /api/dashboard`.

6. **Frontend: implement DashboardComponent**
   - Header with greeting and primary/secondary actions.
   - Workforce pulse tiles.
   - Action needed list.
   - Quick links and Me card in left column.
   - Recent activity stream with filter chips.
   - Skill coverage snapshot.

7. **Frontend: wire route and navigation**
   - Update `app.routes.ts` so `/dashboard` loads `DashboardComponent`.
   - Remove dashboard-specific `ComingSoonComponent` usage.

8. **Frontend: unit tests**
   - `dashboard.spec.ts`: loading, render, filter, empty states, navigation links.

9. **Frontend: e2e test**
   - `e2e/dashboard.spec.ts`: login, visit `/dashboard`, verify pulse tiles and sections.

10. **Verification**
    - Frontend unit tests pass.
    - Backend unit tests pass.
    - e2e dashboard smoke test passes.
