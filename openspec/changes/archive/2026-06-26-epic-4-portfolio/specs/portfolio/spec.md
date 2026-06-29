# Portfolio Specification

## Purpose

Defines the REST API and Angular UI for managing an employee's portfolio: education history, projects worked on, and public showcase links. The skills section is added later by Epic 5 (S7) to avoid a forward dependency.

## Requirements

### Requirement: Portfolio data model

The system SHALL provide three portfolio sub-resources owned by an Employee:

- `Education`: `institution` (String, not null), `qualification` (String, not null), `fieldOfStudy` (String, nullable), `startYear` (Integer, nullable), `endYear` (Integer, nullable), `description` (String, nullable).
- `Project`: `name` (String, not null), `description` (String, nullable), `startDate` (LocalDate, nullable), `endDate` (LocalDate, nullable), `url` (String, nullable).
- `ShowcaseLink`: `label` (String, not null), `url` (String, not null), `sortOrder` (Integer, default 0).

Each sub-resource SHALL store `employeeId` as a scalar `Long` and the service SHALL validate the employee exists before creation or update.

#### Scenario: Education is persisted

- **WHEN** a valid `CreateEducationRequest` is POSTed for an existing employee
- **THEN** an `EducationResponse` is returned with HTTP 201 and the education entry is visible in the full portfolio

#### Scenario: Project is persisted

- **WHEN** a valid `CreateProjectRequest` is POSTed for an existing employee
- **THEN** a `ProjectResponse` is returned with HTTP 201 and the project is visible in the full portfolio

#### Scenario: Showcase link is persisted

- **WHEN** a valid `CreateShowcaseLinkRequest` is POSTed for an existing employee
- **THEN** a `ShowcaseLinkResponse` is returned with HTTP 201 and the link is visible in the full portfolio

### Requirement: Full portfolio view

The system SHALL expose `GET /api/employees/{employeeId}/portfolio` (authenticated) that returns a `PortfolioResponse` containing all education entries, projects, and showcase links for the given employee, ordered consistently.

#### Scenario: Portfolio with data renders all sections

- **WHEN** an employee has education, projects, and links
- **THEN** the full portfolio response contains all three lists

#### Scenario: Empty portfolio renders empty-but-present sections

- **WHEN** an employee has no portfolio data
- **THEN** the full portfolio response contains empty arrays for all three lists

### Requirement: Education CRUD

The system SHALL expose the following authenticated endpoints for an employee's education:

- `POST /api/employees/{employeeId}/portfolio/education` — create, returns 201.
- `PUT /api/employees/{employeeId}/portfolio/education/{id}` — update, returns 200.
- `DELETE /api/employees/{employeeId}/portfolio/education/{id}` — delete, returns 204.

#### Scenario: Create education with missing required field

- **WHEN** a `CreateEducationRequest` with a blank `institution` is submitted
- **THEN** the response is HTTP 400 and no record is persisted

#### Scenario: Update education

- **WHEN** an existing education entry is updated with valid fields
- **THEN** the response is HTTP 200 and the change is reflected in the full portfolio

#### Scenario: Delete education

- **WHEN** an existing education entry is deleted
- **THEN** the response is HTTP 204 and the entry is no longer in the full portfolio

#### Scenario: Education operation for unknown employee

- **WHEN** any education endpoint is called for a non-existent employee
- **THEN** the response is HTTP 404

### Requirement: Project CRUD

The system SHALL expose the following authenticated endpoints for an employee's projects:

- `POST /api/employees/{employeeId}/portfolio/projects` — create, returns 201.
- `PUT /api/employees/{employeeId}/portfolio/projects/{id}` — update, returns 200.
- `DELETE /api/employees/{employeeId}/portfolio/projects/{id}` — delete, returns 204.

#### Scenario: Create project with missing required field

- **WHEN** a `CreateProjectRequest` with a blank `name` is submitted
- **THEN** the response is HTTP 400 and no record is persisted

#### Scenario: Update project

- **WHEN** an existing project is updated with valid fields
- **THEN** the response is HTTP 200 and the change is reflected in the full portfolio

#### Scenario: Delete project

- **WHEN** an existing project is deleted
- **THEN** the response is HTTP 204 and the project is no longer in the full portfolio

#### Scenario: Project operation for unknown employee

- **WHEN** any project endpoint is called for a non-existent employee
- **THEN** the response is HTTP 404

### Requirement: Showcase link CRUD and URL validation

The system SHALL expose the following authenticated endpoints for an employee's showcase links:

- `POST /api/employees/{employeeId}/portfolio/links` — create, returns 201.
- `PUT /api/employees/{employeeId}/portfolio/links/{id}` — update, returns 200.
- `DELETE /api/employees/{employeeId}/portfolio/links/{id}` — delete, returns 204.

`url` SHALL be validated as a valid URL.

#### Scenario: Create link with valid URL

- **WHEN** a `CreateShowcaseLinkRequest` with a valid URL is submitted
- **THEN** the response is HTTP 201 and the link is persisted

#### Scenario: Create link with invalid URL

- **WHEN** a `CreateShowcaseLinkRequest` with an invalid URL is submitted
- **THEN** the response is HTTP 400 and no record is persisted

#### Scenario: Delete link

- **WHEN** an existing link is deleted
- **THEN** the response is HTTP 204 and the link is no longer in the full portfolio

### Requirement: Angular portfolio feature

The frontend SHALL provide a `PortfolioService` and a `PortfolioComponent` at `/employees/:id/portfolio`. The component SHALL render sections for education, projects, and links, each supporting add/edit/delete. Empty sections SHALL render without errors. The employee profile SHALL link to the portfolio view.

#### Scenario: Portfolio view loads all sections

- **WHEN** an authenticated user navigates to `/employees/:id/portfolio`
- **THEN** education, projects, and links sections are displayed

#### Scenario: Add education through the UI

- **WHEN** a user fills and submits the education form
- **THEN** the education entry appears in the section

#### Scenario: Delete link through the UI

- **WHEN** a user clicks delete on a link
- **THEN** the link is removed from the section
