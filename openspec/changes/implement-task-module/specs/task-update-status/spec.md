## ADDED Requirements

### Requirement: Update task status
The system SHALL allow an authenticated employee to change the status of a task. Only the task's subject (`relatesTo`) or creator (`createdBy`) SHALL be permitted to update it (D4). Valid statuses are OPEN and DONE.

#### Scenario: Subject marks task as done
- **WHEN** the current user is the `relatesTo` employee of a task and submits a status update to DONE
- **THEN** the task status is updated to DONE, persisted, and HTTP 200 is returned with the updated task

#### Scenario: Creator marks task as done
- **WHEN** the current user is the `createdBy` employee of a task and submits a status update to DONE
- **THEN** the task status is updated to DONE, persisted, and HTTP 200 is returned with the updated task

#### Scenario: Unrelated employee cannot update task
- **WHEN** the current user is neither the `relatesTo` nor the `createdBy` of a task and attempts a status update
- **THEN** the system returns HTTP 403 Forbidden and the task status is unchanged

#### Scenario: Done task removed from open list
- **WHEN** a task is marked DONE
- **THEN** it no longer appears when the subject fetches their open tasks (if open-only filtering is applied)

#### Scenario: Non-existent task returns 404
- **WHEN** the current user attempts to update a task ID that does not exist
- **THEN** the system returns HTTP 404 and no change is made
