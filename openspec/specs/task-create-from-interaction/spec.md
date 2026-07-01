# task-create-from-interaction Specification

## Purpose
TBD - created by archiving change implement-task-module. Update Purpose after archive.
## Requirements
### Requirement: Create task from interaction
The system SHALL allow an authenticated employee to create a task spawned from an existing interaction. The task SHALL automatically carry `fromInteraction` (the source interaction), `relatesTo` (the interaction's subject employee), and `createdBy` (the current authenticated user).

#### Scenario: Successful task creation from interaction
- **WHEN** an authenticated user posts a valid task payload referencing an existing interaction ID
- **THEN** the system saves the task with `fromInteraction` set to that interaction, `relatesTo` set to the interaction's subject, `createdBy` set to the current user, and returns HTTP 201 with the created task

#### Scenario: Missing title rejected
- **WHEN** an authenticated user posts a task payload with no title (or a blank title)
- **THEN** the system returns HTTP 400 with a validation error and no task is saved

#### Scenario: Non-existent interaction rejected
- **WHEN** an authenticated user posts a task referencing an interaction ID that does not exist
- **THEN** the system returns HTTP 404 and no task is saved

#### Scenario: Task inherits subject from interaction
- **WHEN** interaction X has subject Employee A and current user is Employee B
- **THEN** the saved task has `relatesTo = Employee A` and `createdBy = Employee B`

