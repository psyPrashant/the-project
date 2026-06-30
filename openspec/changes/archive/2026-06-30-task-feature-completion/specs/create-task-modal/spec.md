## ADDED Requirements

### Requirement: Create task via inline modal
A `CreateTaskModalComponent` SHALL be available that can be opened from both the My Tasks page and an employee profile Tasks section without navigating away. The modal SHALL accept an optional `relatesToId`; when provided, the subject employee field SHALL be pre-filled and locked (read-only). On save the task list SHALL refresh in place. The existing `/tasks/new` route SHALL remain accessible for backwards compatibility.

#### Scenario: Modal opens from My Tasks with no pre-filled subject
- **WHEN** the user clicks "New task" on the My Tasks page
- **THEN** the create task modal opens with an empty, editable "Relates to" employee selector

#### Scenario: Modal opens from profile Tasks section with pre-filled subject
- **WHEN** the user clicks "New task" on an employee's profile Tasks section
- **THEN** the create task modal opens with the profile employee pre-filled in the "Relates to" field and that field is locked (cannot be changed)

#### Scenario: Task list refreshes on save without navigation
- **WHEN** the user submits the create task modal with valid data
- **THEN** a POST /api/tasks request is made, the modal closes, and the new task appears in the task list without a page reload or route change

#### Scenario: Modal closes on cancel
- **WHEN** the user clicks cancel in the create task modal
- **THEN** the modal closes and no task is created

#### Scenario: /tasks/new route still works
- **WHEN** a user navigates directly to /tasks/new
- **THEN** the standalone task creation page renders as before (backwards compat)
