# task-create-standalone Specification

## Purpose
TBD - created by archiving change implement-task-module. Update Purpose after archive.
## Requirements
### Requirement: Create standalone task against an employee
The system SHALL allow an authenticated employee to create a task that is not linked to any interaction. The task SHALL have `relatesTo` set to the specified subject employee, `createdBy` set to the current authenticated user, and `fromInteraction` SHALL be empty (null).

#### Scenario: Successful standalone task creation
- **WHEN** an authenticated user posts a valid task payload with a subject employee ID and no interaction reference
- **THEN** the system saves the task with `relatesTo` set to the specified employee, `createdBy` set to the current user, `fromInteraction` null, and returns HTTP 201 with the created task

#### Scenario: Missing title rejected
- **WHEN** an authenticated user posts a standalone task payload with no title (or a blank title)
- **THEN** the system returns HTTP 400 with a validation error and no task is saved

#### Scenario: Missing subject employee rejected
- **WHEN** an authenticated user posts a standalone task payload with no `relatesTo` employee ID
- **THEN** the system returns HTTP 400 with a validation error and no task is saved

#### Scenario: Non-existent subject employee rejected
- **WHEN** an authenticated user posts a standalone task referencing an employee ID that does not exist
- **THEN** the system returns HTTP 404 and no task is saved

#### Scenario: Employee can create a task relating to themselves
- **WHEN** the current authenticated user posts a standalone task with `relatesTo` equal to their own employee ID
- **THEN** the system saves the task normally (self-referential tasks are permitted per D3)

