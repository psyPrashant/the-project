## Why

Archived employees currently vanish from the People list with no way to find or restore them. This leaves managers unable to review past records or correct accidental archives.

## What Changes

- **People list** gains a "Show archived" toggle (default off); when on, archived employees appear inline with an "Archived" badge. Search continues to work across both states. No backend changes — the existing `GET /api/employees` returns all employees; filtering is frontend-only.
- **Employee profile** gains an "Unarchive" button shown only when `emp.archived === true`; clicking it calls a new `POST /api/employees/{id}/unarchive` endpoint that sets `archived = false` and returns the updated record. The profile updates in place — no navigation.

## Capabilities

### New Capabilities
- `people-archive-filter`: Frontend-only "Show archived" toggle on the People list that reveals archived employees with a badge and keeps search functional across both active and archived records.

### Modified Capabilities
- `employee-crud`: Adding the unarchive endpoint (`POST /api/employees/{id}/unarchive`) and the corresponding Unarchive button on the employee profile, which mirrors the existing archive feature.

## Impact

- **Backend**: New endpoint `POST /api/employees/{id}/unarchive` in the `employee` module (`EmployeeController`, `EmployeeService`, `EmployeeServiceImpl`).
- **Frontend**: `EmployeeListComponent` (toggle + badge), `EmployeeService` (new `unarchive()` method), `EmployeeProfileComponent` (Unarchive button + in-place update).
- **Tests**: `employee-list.spec.ts`, `employee-profile.spec.ts`, `people.spec.ts` (e2e), backend unit + IT tests for the new endpoint.
