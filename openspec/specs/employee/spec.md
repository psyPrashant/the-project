# employee Specification

## Purpose
Defines the `Employee` entity as the central identity record of the system. Every other domain (interactions, tasks, portfolio, skills) hangs off an Employee. This spec covers the entity model, persistence/lookup API, and data seeding. CRUD operations are in the employee-crud spec.

## Requirements

### Requirement: Employee identity record
The system SHALL provide an `Employee` entity as the central identity record. The identity slice SHALL expose fields `id` (generated), `firstName` (not null), `lastName` (not null), `email` (unique, the login identifier, not null), `passwordHash` (BCrypt, not null), `jobTitle` (String, nullable), `department` (String, nullable), `phone` (String, nullable), and `archived` (boolean, default false). The entity SHALL NOT expose skills, portfolio, interactions, or tasks in this slice — those are added by later epics.

#### Scenario: Email is unique
- **WHEN** two Employees are persisted with the same email
- **THEN** the system rejects the duplicate via a unique constraint on the `email` column

#### Scenario: Identity fields are populated on a seeded Employee
- **WHEN** a seeded Employee is loaded by id
- **THEN** `firstName`, `lastName`, `email`, and `passwordHash` are present

#### Scenario: Profile fields default to null and archived defaults to false on a new Employee
- **WHEN** an Employee is created without specifying `jobTitle`, `department`, `phone`, or `archived`
- **THEN** those fields are null / false respectively

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
