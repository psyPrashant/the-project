## Why

The Engage application routes `/dashboard` to a "coming soon" placeholder, even though the dashboard is the first screen an HR/admin user sees after signing in. The primary users of the application are HR and admin staff who manage employees, skills, interactions, and follow-up tasks. The dashboard should become a workforce command centre that gives them immediate situational awareness and surfaces work that needs attention, while still giving the signed-in employee a compact personal summary.

## What Changes

- Replace the `ComingSoonComponent` placeholder on `/dashboard` with a real `DashboardComponent`.
- Add a backend dashboard aggregate endpoint (`GET /api/dashboard`) that returns workforce pulse counts, action-needed items, recent activity, skill coverage, and the current user's summary.
- Implement the dashboard UI with workforce pulse tiles, an "Action needed" list, a recent workforce activity stream, a skill coverage snapshot, and a compact "Me" card.
- Update navigation and route configuration so `/dashboard` renders the new component.
- Add unit tests and an e2e smoke test for the new dashboard.

## Capabilities

### New Capabilities

- `workforce-overview` (TSP-53): HR/admin users can see a consolidated view of employees, skills coverage, open tasks, and recent engagement.
- `attention-list` (TSP-53): HR/admin users can identify employees who need follow-up (no skills, overdue tasks, no recent interactions).
- `activity-stream` (TSP-53): HR/admin users can see a cross-module recent activity feed.

### Modified Capabilities

- `dashboard-navigation`: `/dashboard` no longer shows the coming-soon placeholder.

## Impact

**Backend**
- `staff-engagement-backend/src/main/java/com/psybergate/staff_engagement/dashboard/`: new package with `DashboardController`, `DashboardService`, `DashboardServiceImpl`, and response DTOs.
- Calls existing service interfaces from `employee`, `interaction`, `task`, and `skills` modules; no repository cross-module access.

**Frontend**
- `staff-engagement-frontend/src/app/dashboard/dashboard.ts` + `.html`: new dashboard component.
- `staff-engagement-frontend/src/app/dashboard/dashboard.service.ts`: calls `/api/dashboard`.
- `staff-engagement-frontend/src/app/dashboard/dashboard.models.ts`: dashboard response shape.
- `staff-engagement-frontend/src/app/app.routes.ts`: replace dashboard placeholder route.
- `staff-engagement-frontend/src/app/shell/coming-soon/coming-soon.ts`: dashboard usage removed (component kept for other placeholders).

**API**
- New `GET /api/dashboard` returning aggregate dashboard data.

**Dependencies**
- None.
