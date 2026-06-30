## ADDED Requirements

### Requirement: Delete task via backend endpoint
The system SHALL expose `DELETE /api/tasks/{id}`. Only the task creator may delete (stricter than edit — deletion is irreversible). The endpoint SHALL return 204 on success, 403 if the caller is not the creator, and 404 if the task does not exist.

#### Scenario: Successful delete by creator
- **WHEN** the task creator sends DELETE /api/tasks/{id}
- **THEN** the task is permanently removed and HTTP 204 is returned

#### Scenario: Delete rejected for subject who is not creator
- **WHEN** the task subject (who is not the creator) sends DELETE /api/tasks/{id}
- **THEN** HTTP 403 is returned and the task is unchanged

#### Scenario: Delete rejected for unrelated user
- **WHEN** a user who is neither creator nor subject sends DELETE /api/tasks/{id}
- **THEN** HTTP 403 is returned and the task is unchanged

#### Scenario: Delete on non-existent task
- **WHEN** DELETE /api/tasks/{id} is called with an id that does not exist
- **THEN** HTTP 404 is returned

### Requirement: Delete task via frontend
A trash (delete) icon SHALL appear on each task card in My Tasks and the profile Tasks section only for the task creator. Clicking it SHALL show a browser confirmation dialog. On confirmation the task SHALL be removed from the list without a page reload.

#### Scenario: Delete icon visible only to creator
- **WHEN** the current user is the task creator
- **THEN** a trash icon is rendered on that task card

#### Scenario: Delete icon not visible to non-creator
- **WHEN** the current user is not the task creator (e.g., subject but not creator)
- **THEN** no trash icon is rendered on that task card

#### Scenario: Confirmation dialog shown before delete
- **WHEN** the task creator clicks the trash icon
- **THEN** a browser confirm() dialog is shown asking the user to confirm deletion

#### Scenario: Task removed on confirmed delete
- **WHEN** the user confirms the deletion dialog
- **THEN** DELETE /api/tasks/{id} is called and the task is removed from the list without a page reload

#### Scenario: Delete cancelled
- **WHEN** the user dismisses the confirmation dialog
- **THEN** no API call is made and the task remains in the list
