## Context

The Staff Engagement platform has employee and interaction modules in place. There is no mechanism yet to record or track the follow-up actions that interactions generate. The `task` domain module fills this gap. It must integrate cleanly with the existing modular monolith without coupling to interaction or employee internals — all cross-module access goes through service interfaces.

Auth currently resolves the calling user to an `Employee` (D3). The task module relies on this resolved identity for `createdBy` and for "my tasks" filtering.

## Goals / Non-Goals

**Goals:**
- Introduce a `task` module following the established `Controller → Service → ServiceImpl → Repository` pattern.
- Support two creation paths: spawned from an interaction (T1) and standalone against any employee (T2).
- Provide a "my tasks" query that returns all tasks where `relatesTo = current user` (T3).
- Enforce the D4 permission rule: only the subject (`relatesTo`) or creator (`createdBy`) may update a task.
- Support `dueDate` and `assignee` as optional fields (T5 extension), with assigned tasks surfacing to the assignee separately from "relates to me" tasks.

**Non-Goals:**
- Pagination of task lists (D6).
- RBAC or role-based task routing (D6).
- Notifications when tasks are created or assigned (D6).
- Audit history beyond `createdBy` and timestamps (D6).

## Decisions

### D-1: Task status as a Java enum
`TaskStatus { OPEN, DONE }` stored as a `VARCHAR` in Postgres. Avoids integer-magic and is readable in the database. Considered a `boolean completed` field — rejected because status is likely to grow (e.g., IN_PROGRESS) even if not in this POC.

### D-2: Permission check in the service layer
The D4 rule (only subject or creator may update) is enforced in `TaskServiceImpl`, not in the controller. The controller is a thin boundary; business rules live in the service. A `403 Forbidden` is thrown when the check fails.

### D-3: Cross-module calls via service interfaces only
`TaskServiceImpl` calls `EmployeeService` to resolve employees and `InteractionService` to validate and load interactions. No direct repository access across module boundaries. This preserves the monolith's seam for future extraction.

### D-4: "My tasks" = relatesTo OR assignee
`GET /api/tasks/mine` returns tasks where `relatesTo = currentUser` **or** `assignee = currentUser`. This satisfies T3 (relates-to filter) and T5 (assignee filter) in a single endpoint, avoiding two separate list views. The frontend can group/filter client-side if needed.

### D-5: `fromInteraction` is nullable at the database level
A standalone task (T2) simply omits `fromInteraction`. There is no separate entity or inheritance — one `task` table, one service, one controller. The creation path (from interaction vs. standalone) is determined by which request DTO is used, not by the entity type.

### D-6: Flyway migration owns the schema
A new versioned Flyway script (`VX__create_task_table.sql`) creates the `task` table. The version number must be the next in sequence after the latest existing migration.

## Risks / Trade-offs

- **Current-user resolution not standardised** → The interaction module presumably already resolves `createdBy`; the task module should follow the same pattern. If auth is a stub/mock for POC, the task service must handle a null/default employee gracefully in tests. Mitigation: use the same `AuthService`/`SecurityContext` helper already used by the interaction module.
- **Orphan tasks if an employee is deleted** → FK constraints on `relates_to_id`, `created_by_id`, and `assignee_id` will prevent deletion of referenced employees. Acceptable for POC; a production system would soft-delete employees. Mitigation: document in CLAUDE.md, no code change needed.
- **`OPEN`/`DONE` enum is limiting** → If the team later wants `IN_PROGRESS`, the DB column and Java enum both need a migration. Mitigated by using `VARCHAR` (not an int or a Postgres enum), making the migration a simple `ALTER TABLE ADD CHECK` rather than a type change.
