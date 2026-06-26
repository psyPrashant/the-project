## Why

The Employee is the central record that everything else in the platform hangs off — interactions, tasks, and portfolios all require an Employee to exist first. Currently the `employee` module only supports authentication (login + /me); there are no endpoints to create, view, list, edit, or deactivate employees, making the rest of the platform impossible to use.

## What Changes

- Add `jobTitle`, `department`, `phone`, and `archived` fields to the `Employee` entity.
- Add CRUD REST endpoints: `POST /api/employees`, `GET /api/employees`, `GET /api/employees/{id}`, `PUT /api/employees/{id}`, `PATCH /api/employees/{id}/archive`.
- Add `search` query param to the list endpoint for name-based filtering.
- Add `CreateEmployeeRequest`, `UpdateEmployeeRequest`, and `EmployeeProfileResponse` DTOs.
- Expand `EmployeeService` interface and `EmployeeServiceImpl` with the new operations.
- Extend `EmployeeRepository` with queries for listing active (non-archived) employees and name search.
- Add an `EmployeeController` to the `employee` module.
- Angular: add `EmployeeService`, `EmployeeListComponent`, `EmployeeFormComponent`, `EmployeeProfileComponent`, and route configuration.
- Update `data.sql` to seed the new nullable fields for existing test users.
- Full unit + integration tests (backend) and Vitest component/service tests (frontend).

## Capabilities

### New Capabilities
- `employee-crud`: Full lifecycle management of Employee records — create, read (profile view), list & search by name, update, and soft-archive. Covers Jira stories TSP-15 through TSP-19.

### Modified Capabilities
- `employee`: The existing identity-only spec gains additional profile fields (`jobTitle`, `department`, `phone`), a soft-archive flag (`archived`), and new CRUD requirements on top of the authentication slice already specified.

## Impact

- **Backend**: `employee` module — `Employee.java`, `EmployeeRepository.java`, `EmployeeService.java`, `EmployeeServiceImpl.java`; new `EmployeeController.java`; new DTOs `CreateEmployeeRequest`, `UpdateEmployeeRequest`, `EmployeeProfileResponse`; `data.sql` updated.
- **Frontend**: new `employees/` feature folder — `employee.service.ts`, `employee.models.ts`, `employee-list/`, `employee-form/`, `employee-profile/` components; `app.routes.ts` updated.
- **API surface**: Five new REST endpoints under `/api/employees`.
- **Database**: Two new nullable varchar columns (`job_title`, `department`, `phone`) and one boolean column (`archived DEFAULT false`) on the `employees` table; schema updated via Hibernate `ddl-auto=update` (no Flyway in place).
- **No breaking changes** to existing auth endpoints or the `authentication` spec.
