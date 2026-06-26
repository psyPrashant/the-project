## MODIFIED Requirements

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
