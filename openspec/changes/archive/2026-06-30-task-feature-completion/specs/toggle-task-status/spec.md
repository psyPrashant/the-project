## ADDED Requirements

### Requirement: Reopen a done task
A done task SHALL display a "Reopen" button to the task creator or subject (D4 — same permission as Mark Done). Clicking it SHALL call `PATCH /api/tasks/{id}/status` with `{ "status": "OPEN" }` and move the task back to the Open section without a page reload.

#### Scenario: Reopen button visible on done tasks for permitted user
- **WHEN** the current user is the creator or subject of a done task
- **THEN** a "Reopen" button is rendered alongside that done task in both My Tasks and the profile Tasks section

#### Scenario: Reopen button not visible on open tasks
- **WHEN** a task has status OPEN
- **THEN** no "Reopen" button is rendered for that task

#### Scenario: Reopen button not visible to unpermitted user
- **WHEN** the current user is neither the creator nor the subject of a done task
- **THEN** no "Reopen" button is rendered for that task

#### Scenario: Successful reopen
- **WHEN** a permitted user clicks "Reopen" on a done task
- **THEN** the system calls PATCH /api/tasks/{id}/status with status OPEN, the button shows a loading state while in flight, and on success the task moves from the Done section to the Open section

#### Scenario: Loading state during reopen
- **WHEN** the reopen request is in flight
- **THEN** the "Reopen" button is disabled and shows a saving indicator
