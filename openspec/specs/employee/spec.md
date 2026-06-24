# employee Specification

## Purpose
TBD - created by archiving change add-authentication-current-employee. Update Purpose after archive.
## Requirements
### Requirement: Employee identity record
The system SHALL provide an `Employee` entity as the central identity record. The identity slice SHALL expose fields `id` (generated), `firstName`, `lastName`, `email` (unique, the login identifier), and `passwordHash` (BCrypt). The entity SHALL NOT expose skills, portfolio, interactions, or tasks in this slice — those are added by later epics.

#### Scenario: Email is unique
- **WHEN** two Employees are persisted with the same email
- **THEN** the system rejects the duplicate via a unique constraint on the `email` column

#### Scenario: Identity fields are populated on a seeded Employee
- **WHEN** a seeded Employee is loaded by id
- **THEN** `firstName`, `lastName`, `email`, and `passwordHash` are present

### Requirement: Employee persistence and lookup
The system SHALL provide an `EmployeeRepository` (Spring Data JPA) and an `EmployeeService` interface with an `EmployeeServiceImpl`. Lookups SHALL be available by email (for authentication) and by id (for current-Employee resolution). Reads SHALL be `@Transactional(readOnly=true)`. Cross-module callers SHALL depend on `EmployeeService`, never the repository.

#### Scenario: Lookup by email
- **WHEN** `EmployeeService.findByEmail(email)` is called with an existing email
- **THEN** it returns the matching `Employee`

#### Scenario: Lookup by email misses
- **WHEN** `EmployeeService.findByEmail(email)` is called with an unknown email
- **THEN** it returns an empty `Optional`

#### Scenario: Lookup by id
- **WHEN** `EmployeeService.findById(id)` is called with an existing id
- **THEN** it returns the matching `Employee`

### Requirement: Employees are never exposed as entities over the API
The system SHALL map `Employee` to an `EmployeeResponse` DTO (id, email, firstName, lastName — never `passwordHash`) for API responses. Entities SHALL NOT be serialized directly.

#### Scenario: passwordHash is never serialized
- **WHEN** an `EmployeeResponse` is returned from the API
- **THEN** the response body does NOT contain a `passwordHash` field

### Requirement: Seed Employees for login
The system SHALL seed a small set of Employees with pre-computed BCrypt password hashes via `data.sql`, using `INSERT ... ON CONFLICT (email) DO NOTHING` for idempotency. Schema initialization and seeding SHALL be enabled in both the main and test profiles so integration tests find seeded Employees.

#### Scenario: Seeded employees exist after startup
- **WHEN** the application (or integration test context) starts
- **THEN** at least three Employees exist, each with a valid BCrypt `passwordHash`

#### Scenario: Re-running the seed is idempotent
- **WHEN** `data.sql` runs again (e.g. application restart with `ddl-auto=update`, or a reused test container)
- **THEN** no duplicate-key error occurs and the seeded rows remain unchanged

