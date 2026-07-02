## Dashboard Feature Specification

### API

#### `GET /api/dashboard`

Returns aggregated dashboard data for the authenticated user.

**Response body:**

```json
{
  "workforcePulse": {
    "totalEmployees": 12,
    "employeesWithSkills": 8,
    "openTasks": 5,
    "interactionsThisWeek": 7
  },
  "actionNeeded": [
    {
      "employeeId": 3,
      "employeeName": "John Smith",
      "reason": "No skills recorded",
      "link": "/people/3"
    }
  ],
  "recentActivity": [
    {
      "type": "skill",
      "actorName": "Admin User",
      "targetEmployeeId": 2,
      "targetEmployeeName": "Jane Doe",
      "description": "Added Java skill",
      "occurredAt": "2026-07-01T14:30:00Z"
    }
  ],
  "skillCoverage": {
    "topSkills": [
      { "skillName": "Angular", "employeeCount": 5 }
    ],
    "orphanedSkills": [
      { "skillId": 9, "skillName": "Rust" }
    ]
  },
  "me": {
    "employeeId": 1,
    "employeeName": "Admin User",
    "skillCount": 3,
    "openTaskCount": 2,
    "recentInteractionCount": 4
  }
}
```

**Field semantics:**

- `workforcePulse`: counts for the dashboard stat tiles.
- `actionNeeded`: employees who require follow-up. `reason` is a human-readable label.
- `recentActivity`: cross-module events from the last 14 days, sorted newest first, limited to ~20 items.
- `skillCoverage`: top skills by employee count and canonical skills with no linked employees.
- `me`: compact summary for the signed-in user.

### Frontend

#### Component

- `DashboardComponent` in `src/app/dashboard/dashboard.ts` + `.html`.
- Uses signals (`dashboardData`, `loading`, `activityFilter`) and `OnPush`.
- Loads data in `ngOnInit` via `DashboardService`.

#### Service

- `DashboardService` with `getDashboard(): Observable<DashboardResponse>`.

#### Models

- `DashboardResponse`, `WorkforcePulse`, `ActionNeededItem`, `ActivityItem`, `SkillCoverage`, `SkillCoverageItem`, `MeSummary`.

#### Route

- `/dashboard` loads `DashboardComponent` directly; `ComingSoonComponent` is no longer used here.

### Behaviour

- On load, show a loading state, then render the dashboard sections.
- Selecting an activity filter chip (`All`, `People`, `Skills`, `Interactions`, `Tasks`) filters the visible `recentActivity` list client-side.
- Clicking a stat tile, action item, or activity row navigates to the relevant module/profile.
- Empty states display friendly guidance and next actions.

### Tests

- Unit tests for `DashboardService` response mapping and `DashboardComponent` rendering, filtering, and empty states.
- e2e smoke test verifying `/dashboard` loads with pulse tiles and sections after login.
