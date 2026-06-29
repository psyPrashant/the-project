## ADDED Requirements

### Requirement: Set due date on a task
The system SHALL allow a due date to be set on a task at creation or via update. The due date SHALL be optional; tasks without a due date are valid.

#### Scenario: Task created with a due date
- **WHEN** an authenticated user creates a task and includes a `dueDate` value
- **THEN** the task is saved with the due date persisted and returned in the response

#### Scenario: Task created without a due date
- **WHEN** an authenticated user creates a task without providing a `dueDate`
- **THEN** the task is saved with `dueDate` null and HTTP 201 is returned

#### Scenario: Due date updated on existing task
- **WHEN** the subject or creator of a task updates the `dueDate` field
- **THEN** the new due date is persisted and returned in the response

### Requirement: Assign a task to an employee
The system SHALL allow an `assignee` to be set on a task, distinct from `relatesTo` (per D2). The `assignee` represents who should action the task. The assignee SHALL be an existing employee. The `assignee` field is optional.

#### Scenario: Task created with an assignee
- **WHEN** an authenticated user creates a task with an `assigneeId` referencing a valid employee
- **THEN** the task is saved with the assignee persisted and HTTP 201 is returned

#### Scenario: Non-existent assignee rejected
- **WHEN** an authenticated user creates or updates a task with an `assigneeId` that does not exist
- **THEN** the system returns HTTP 404 and no task is saved or changed

#### Scenario: Assigned tasks appear in assignee's task list
- **WHEN** Employee A is set as `assignee` on a task where `relatesTo = Employee B`
- **THEN** the task appears in Employee A's task list (via the mine endpoint, which includes `assignee = current user`)
- **AND** the task also appears in Employee B's task list (via `relatesTo = current user`)

#### Scenario: Assignee distinct from relatesTo
- **WHEN** a task has `relatesTo = Employee A` and `assignee = Employee B`
- **THEN** both employees see the task in their respective lists but the task is stored once with both fields set
