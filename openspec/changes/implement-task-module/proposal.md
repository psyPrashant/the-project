## Why

The platform can log interactions between staff but has no way to capture or track the follow-up actions those interactions generate. A Task module closes this gap — giving employees a structured place to record, own, and complete follow-up work tied to people and interactions.

## What Changes

- New `task` domain module on the backend (entity, repository, service interface + impl, controller, DTOs, Flyway migration).
- New task-related endpoints: create from interaction, create standalone, list "my tasks" (where `relatesTo = me`), update status, and (extension) set due date + assignee.
- Frontend task screens: create-task form (from interaction or standalone), "My Tasks" list view, task detail/update view.
- Permission enforcement: only subject or creator may update a task (D4).
- Extension: `assignee` field (distinct from `relatesTo`) and `dueDate` — surfaces tasks to the assignee separately from "relates to me" (D2/T5).

## Capabilities

### New Capabilities

- `task-create-from-interaction`: Create a task spawned from an existing interaction, automatically linking `fromInteraction`, `relatesTo = interaction's subject`, and `createdBy = current user`.
- `task-create-standalone`: Create a task against any employee without an interaction link; `fromInteraction` is empty.
- `task-list-mine`: Retrieve all tasks where `relatesTo = current user`, regardless of who created them.
- `task-update-status`: Mark a task open/done; restricted to the task's subject or creator (D4).
- `task-due-date-and-assignee`: (Extension) Persist `dueDate` and `assignee` on a task; surface assigned tasks separately from "relates to me" tasks.

### Modified Capabilities

- `interaction`: Interaction detail view gains a "Create follow-up task" action (UI change only — no requirement change to the interaction spec itself).

## Impact

- **Backend**: New `task` module under `com.psybergate.staff_engagement.task` (entity, repo, service, controller, DTOs). New Flyway migration for the `task` table. Cross-module read of `interaction` and `employee` via their service interfaces.
- **Frontend**: New Angular routes/components for task creation, "My Tasks" list, and task update. `interaction-detail` component updated to show "Create task" button.
- **Database**: New `task` table with columns: `id`, `title`, `description`, `status`, `relates_to_id` (FK → employee), `created_by_id` (FK → employee), `from_interaction_id` (FK → interaction, nullable), `due_date` (nullable), `assignee_id` (FK → employee, nullable), `created_at`, `updated_at`.
- **API**: New endpoints under `/api/tasks`.
- **Tests**: Unit tests (Mockito) + integration tests (Testcontainers, `*IT`) for all service and controller paths; Playwright e2e smoke test for the create-task and my-tasks flows.
