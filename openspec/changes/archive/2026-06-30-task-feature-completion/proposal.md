## Why

The task module shipped with only create and mark-done functionality, leaving users unable to reopen, edit, or delete tasks, and requiring a full page navigation to create one. These gaps make the task feature incomplete for day-to-day use.

## What Changes

- Done tasks can be toggled back to open via a "Reopen" action (no backend change needed)
- Task creators and subjects can edit task details (title, description, due date, assignee) via a new `PUT /api/tasks/{id}` endpoint and an inline edit modal
- Task creators can permanently delete a task via a new `DELETE /api/tasks/{id}` endpoint with a confirmation dialog
- Creating a task from a profile page or My Tasks now opens an inline modal instead of navigating away; the `/tasks/new` route is kept for backwards compatibility

## Capabilities

### New Capabilities

- `toggle-task-status`: Reopen a done task back to open status; done tasks show a "Reopen" button alongside the existing "Mark Done" button, guarded by the same D4 permission check (creator or subject)
- `edit-task`: Edit a task's title, description, due date, and assignee; available to creator or subject (D4); backend `PUT /api/tasks/{id}` + frontend edit modal
- `delete-task`: Permanently delete a task; creator-only; backend `DELETE /api/tasks/{id}` + frontend trash icon with browser confirm dialog
- `create-task-modal`: Create a task without leaving the current page; modal accepts an optional `relatesToId` to pre-fill the subject employee; replaces page navigation in profile Tasks section and My Tasks

### Modified Capabilities

(none — no existing spec-level requirements are changing)

## Impact

- **Backend**: `task` module — two new endpoints (`PUT /{id}`, `DELETE /{id}`), one new DTO (`UpdateTaskRequest`), two new service methods; no schema migrations needed
- **Frontend**: `tasks/` directory — two new modal components, updates to `my-tasks` and `tasks-section` templates, `task.service.ts`, `task.models.ts`
- **Tests**: `TaskServiceImplTest`, `TaskIT`, `my-tasks.spec.ts`, `tasks-section.spec.ts`, new modal specs, `e2e/task.spec.ts`
- **No breaking API changes** — all new endpoints; existing `PATCH /{id}/status` is unchanged
