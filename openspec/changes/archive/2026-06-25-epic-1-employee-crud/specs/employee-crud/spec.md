## ADDED Requirements

### Requirement: Employee profile fields
The `Employee` entity SHALL include optional profile fields: `jobTitle` (String, nullable), `department` (String, nullable), and `phone` (String, nullable). These fields SHALL be persisted to the database and returned in `EmployeeProfileResponse`. The existing authentication fields (`email`, `passwordHash`) and identity fields (`firstName`, `lastName`) are unchanged.

#### Scenario: Profile fields are persisted on create
- **WHEN** a `CreateEmployeeRequest` with `jobTitle`, `department`, and `phone` is submitted
- **THEN** the created employee record contains those values

#### Scenario: Profile fields are optional
- **WHEN** a `CreateEmployeeRequest` omits `jobTitle`, `department`, and `phone`
- **THEN** the employee is created successfully with those fields null

### Requirement: Create employee
The system SHALL expose `POST /api/employees` (authenticated). A valid request with `firstName`, `lastName`, and `email` (plus optional profile fields) SHALL create and return an `EmployeeProfileResponse` with HTTP 201. The new employee SHALL be visible in subsequent list and profile calls.

#### Scenario: Create with valid required fields
- **WHEN** an authenticated user POSTs a valid `CreateEmployeeRequest`
- **THEN** the response is HTTP 201 with an `EmployeeProfileResponse` containing a generated `id`

#### Scenario: Create with missing required field
- **WHEN** an authenticated user POSTs a `CreateEmployeeRequest` with a blank `firstName`
- **THEN** the response is HTTP 400 and no record is persisted

#### Scenario: Create with duplicate email
- **WHEN** an authenticated user POSTs a `CreateEmployeeRequest` with an email that already exists
- **THEN** the response is HTTP 409 Conflict and no new record is persisted

#### Scenario: Create requires authentication
- **WHEN** an unauthenticated request is made to `POST /api/employees`
- **THEN** the response is HTTP 401

### Requirement: Get employee profile
The system SHALL expose `GET /api/employees/{id}` (authenticated) that returns the `EmployeeProfileResponse` for the given employee. An unknown `id` SHALL return HTTP 404.

#### Scenario: Get existing employee profile
- **WHEN** an authenticated user requests `GET /api/employees/{id}` for an existing employee
- **THEN** the response is HTTP 200 with the full `EmployeeProfileResponse`

#### Scenario: Get unknown employee
- **WHEN** an authenticated user requests `GET /api/employees/{id}` for a non-existent id
- **THEN** the response is HTTP 404

### Requirement: List and search employees
The system SHALL expose `GET /api/employees` (authenticated) that returns all non-archived employees. An optional `?search=` query parameter SHALL filter results to employees whose `firstName` or `lastName` contains the search term (case-insensitive). An empty search result SHALL return an empty array, not an error.

#### Scenario: List all employees
- **WHEN** an authenticated user requests `GET /api/employees` with no query param
- **THEN** the response is HTTP 200 with an array of `EmployeeProfileResponse` for all non-archived employees

#### Scenario: Search by name
- **WHEN** an authenticated user requests `GET /api/employees?search=Jane`
- **THEN** only employees whose first or last name contains "Jane" (case-insensitive) are returned

#### Scenario: Search with no matches
- **WHEN** an authenticated user searches for a name that matches no employee
- **THEN** the response is HTTP 200 with an empty array

#### Scenario: Archived employees excluded from list
- **WHEN** an employee has been archived and `GET /api/employees` is called
- **THEN** the archived employee is NOT present in the response array

### Requirement: Update employee record
The system SHALL expose `PUT /api/employees/{id}` (authenticated) that replaces the employee's updatable fields with the values in `UpdateEmployeeRequest`. Required fields (`firstName`, `lastName`, `email`) must remain non-blank. Changes SHALL be persisted and reflected in subsequent get/list calls.

#### Scenario: Update with valid data
- **WHEN** an authenticated user PUTs a valid `UpdateEmployeeRequest` to an existing employee
- **THEN** the response is HTTP 200 with the updated `EmployeeProfileResponse`

#### Scenario: Update with blank required field
- **WHEN** an authenticated user PUTs an `UpdateEmployeeRequest` with a blank `lastName`
- **THEN** the response is HTTP 400 and the existing record is unchanged

#### Scenario: Update unknown employee
- **WHEN** an authenticated user PUTs to a non-existent employee id
- **THEN** the response is HTTP 404

### Requirement: Archive an employee
The system SHALL expose `PATCH /api/employees/{id}/archive` (authenticated) that sets `archived=true` on the employee. The employee's record, interactions, tasks, and portfolio SHALL remain intact and queryable by id after archiving. Archived employees SHALL NOT appear in the default list.

#### Scenario: Archive an active employee
- **WHEN** an authenticated user sends `PATCH /api/employees/{id}/archive`
- **THEN** the response is HTTP 204 and the employee's `archived` field becomes true

#### Scenario: Archived employee excluded from default list
- **WHEN** an employee has been archived
- **THEN** `GET /api/employees` does NOT include them

#### Scenario: Archived employee profile still accessible by id
- **WHEN** an employee has been archived
- **THEN** `GET /api/employees/{id}` still returns their profile with `archived: true`

### Requirement: Employee CRUD DTOs
The system SHALL use dedicated DTOs for the CRUD surface:
- `CreateEmployeeRequest`: `@NotBlank firstName`, `@NotBlank lastName`, `@Email @NotBlank email`, optional `jobTitle`, `department`, `phone`.
- `UpdateEmployeeRequest`: same field set and constraints as `CreateEmployeeRequest`.
- `EmployeeProfileResponse`: `id`, `firstName`, `lastName`, `email`, `jobTitle`, `department`, `phone`, `archived`. SHALL NOT include `passwordHash`.

#### Scenario: passwordHash absent from profile response
- **WHEN** `GET /api/employees/{id}` is called
- **THEN** the response body does NOT contain a `passwordHash` field

### Requirement: Angular employee feature
The frontend SHALL provide an `EmployeeService` and three standalone components (`EmployeeListComponent`, `EmployeeFormComponent`, `EmployeeProfileComponent`) wired to routes `/employees`, `/employees/new`, `/employees/:id`, and `/employees/:id/edit`. All routes SHALL be protected by the existing `authGuard`. Components SHALL use OnPush change detection, signals for state, and reactive forms (form component only).

#### Scenario: Employee list loads on navigation
- **WHEN** an authenticated user navigates to `/employees`
- **THEN** the list of non-archived employees is displayed

#### Scenario: Create form submits and redirects
- **WHEN** an authenticated user fills the create form with valid data and submits
- **THEN** the employee is created and the user is redirected to the new employee's profile

#### Scenario: Edit form pre-fills with existing data
- **WHEN** an authenticated user navigates to `/employees/:id/edit`
- **THEN** the form fields are pre-populated with the employee's current values

#### Scenario: Profile shows empty sections without errors
- **WHEN** an authenticated user views a newly created employee's profile
- **THEN** the profile renders with empty-but-present sections for interactions, tasks, and portfolio (no errors)

#### Scenario: Archive button triggers archival
- **WHEN** an authenticated user clicks Archive on an employee profile
- **THEN** the archive endpoint is called and the UI reflects the archived state
