## ADDED Requirements

### Requirement: Edit task via backend endpoint
The system SHALL expose `PUT /api/tasks/{id}` accepting `{ title, description, dueDate, assigneeId }`. Only the task creator or subject (D4) may edit. The endpoint SHALL return the updated `TaskResponse` on success (200), 403 if the caller is neither creator nor subject, and 404 if the task does not exist.

#### Scenario: Successful edit by creator
- **WHEN** the task creator sends a valid PUT /api/tasks/{id} request
- **THEN** the task fields are updated and the updated TaskResponse is returned with HTTP 200

#### Scenario: Successful edit by subject
- **WHEN** the task subject sends a valid PUT /api/tasks/{id} request
- **THEN** the task fields are updated and the updated TaskResponse is returned with HTTP 200

#### Scenario: Edit rejected for unrelated user
- **WHEN** a user who is neither creator nor subject sends PUT /api/tasks/{id}
- **THEN** HTTP 403 is returned and the task is unchanged

#### Scenario: Edit on non-existent task
- **WHEN** PUT /api/tasks/{id} is called with an id that does not exist
- **THEN** HTTP 404 is returned

#### Scenario: Edit with blank title rejected
- **WHEN** PUT /api/tasks/{id} is called with an empty or blank title
- **THEN** HTTP 400 is returned

### Requirement: Edit task via frontend modal
A pencil (edit) icon SHALL appear on each task card in My Tasks and the profile Tasks section for tasks where the current user is the creator or subject. Clicking it SHALL open an inline edit modal pre-populated with the current task data. On save the task card SHALL update in place without a page reload.

#### Scenario: Edit icon visible only to permitted users
- **WHEN** the current user is the creator or subject of a task
- **THEN** a pencil/edit icon is rendered on that task card

#### Scenario: Edit icon not visible to unpermitted users
- **WHEN** the current user is neither creator nor subject of a task
- **THEN** no edit icon is rendered on that task card

#### Scenario: Edit modal opens with existing data
- **WHEN** a permitted user clicks the edit icon on a task
- **THEN** an edit modal opens with the task's current title, description, dueDate, and assignee pre-filled

#### Scenario: Task card updates on successful save
- **WHEN** the user submits the edit modal with valid data
- **THEN** the task card reflects the updated values without a page reload and the modal closes

#### Scenario: Modal closes without save on cancel
- **WHEN** the user clicks cancel in the edit modal
- **THEN** the modal closes and the task data is unchanged
