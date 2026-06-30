## Context

The People list (`GET /api/employees`) currently calls `findByArchivedFalse()` and `searchActiveByName()` — archived employees are filtered on the backend, never sent to the client. TSP-49 says the toggle should be "frontend-only", but the current API makes that impossible without a small backend addition. TSP-50 mirrors the existing `PATCH /{id}/archive` pattern exactly.

## Goals / Non-Goals

**Goals:**
- Add `?includeArchived=true` query parameter to `GET /api/employees` so the frontend can receive all employees when the toggle is on.
- Frontend filters the received list by `employee.archived` to drive the toggle display and badge — no second round-trip.
- Add `PATCH /api/employees/{id}/unarchive` endpoint that sets `archived=false` and returns the updated `EmployeeProfileResponse` (HTTP 200).
- Employee profile shows Unarchive button when `emp.archived === true`; on success, profile updates in place via local signal mutation.

**Non-Goals:**
- No pagination, RBAC, or audit log.
- No navigation away from profile after unarchive.
- No change to default list behaviour — `GET /api/employees` without the param still returns only active employees, preserving existing contract.

## Decisions

### D1 — Small backend addition for archive filter (not pure frontend-only)
**Decision:** Add `?includeArchived=true` to `GET /api/employees`; when absent or false, behaviour is unchanged.

**Why not pure frontend-only?** The existing backend always strips archived records before sending. A purely frontend-only filter has nothing to filter — the data is never delivered. The Jira assumption that the API "already returns all employees" is incorrect.

**Alternative considered:** A separate `GET /api/employees/all` endpoint. Rejected — duplicates the search/list logic; adding a boolean param is less invasive.

### D2 — Unarchive returns updated EmployeeProfileResponse (HTTP 200)
**Decision:** `PATCH /{id}/unarchive` returns `200 EmployeeProfileResponse`, unlike archive which returns `204 void`.

**Why?** The frontend needs the latest server state to update the profile in place. Returning the updated DTO avoids a follow-up `GET` call and mirrors the pattern used by update/edit endpoints.

**Alternative considered:** Return `204` and trigger a separate GET. Rejected — two round-trips for no benefit.

### D3 — Frontend filter uses `computed()` on a single employees signal
**Decision:** `EmployeeListComponent` keeps one signal for the raw API response and a `computed()` for the displayed list, derived from `showArchived` toggle signal.

**Why?** Keeps reactive data flow consistent with existing OnPush + signals pattern. No side effects needed for filtering.

### D4 — `PATCH` method for unarchive (not `POST`)
**Decision:** Use `PATCH /{id}/unarchive` to match the existing `PATCH /{id}/archive` symmetry.

The Jira specifies `POST` but the existing archive uses `PATCH`. `PATCH` is semantically correct (partial update) and keeps the controller and service surface consistent.

## Risks / Trade-offs

- [Risk] Backend query change could affect performance at scale → Mitigation: not a concern for POC; both `findAll()` variants are simple indexed lookups.
- [Risk] `?includeArchived=true` deviates from the Jira's "no backend changes" claim → Mitigation: the change is a one-line addition to the service and repository; the spec delta documents the updated contract.
