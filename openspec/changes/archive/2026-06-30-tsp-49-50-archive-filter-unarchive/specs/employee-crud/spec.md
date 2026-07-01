## ADDED Requirements

### Requirement: Unarchive an employee
The system SHALL expose `PATCH /api/employees/{id}/unarchive` (authenticated) that sets `archived=false` on the employee and returns the updated `EmployeeProfileResponse` with HTTP 200. Any authenticated user may call it (mirrors D4 — unarchive is unrestricted). An unknown `id` SHALL return HTTP 404.

#### Scenario: Unarchive a previously archived employee
- **WHEN** an authenticated user sends `PATCH /api/employees/{id}/unarchive` for an archived employee
- **THEN** the response is HTTP 200 with an `EmployeeProfileResponse` where `archived` is false

#### Scenario: Unarchive an already-active employee is idempotent
- **WHEN** an authenticated user sends `PATCH /api/employees/{id}/unarchive` for a non-archived employee
- **THEN** the response is HTTP 200 with the employee's current profile (no error)

#### Scenario: Unarchive unknown employee returns 404
- **WHEN** an authenticated user sends `PATCH /api/employees/{id}/unarchive` for a non-existent id
- **THEN** the response is HTTP 404

#### Scenario: Unarchive requires authentication
- **WHEN** an unauthenticated request is made to `PATCH /api/employees/{id}/unarchive`
- **THEN** the response is HTTP 401

### Requirement: Unarchive button on employee profile
The `EmployeeProfileComponent` SHALL show an "Unarchive" button when `emp.archived === true`. Clicking it calls `PATCH /api/employees/{id}/unarchive`. On success, the profile SHALL update in place: the "Archived" badge disappears, the Unarchive button disappears, and the Archive button reappears. The user SHALL NOT be navigated away from the profile.

#### Scenario: Unarchive button visible only for archived employees
- **WHEN** an authenticated user views the profile of an archived employee
- **THEN** the "Unarchive" button is visible and the "Archive" button is hidden

#### Scenario: Unarchive button hidden for active employees
- **WHEN** an authenticated user views the profile of an active employee
- **THEN** the "Unarchive" button is not visible and the "Archive" button is visible

#### Scenario: Clicking Unarchive updates profile in place
- **WHEN** the user clicks "Unarchive" on an archived employee's profile
- **THEN** the profile updates in place: the Archived badge is removed, the Unarchive button is replaced by the Archive button, and no navigation occurs
