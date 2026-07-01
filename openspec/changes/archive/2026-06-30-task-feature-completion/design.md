## Context

The task module has a `PATCH /api/tasks/{id}/status` endpoint and a frontend that can mark tasks done. Three CRUD operations are missing: full edit, delete, and a non-navigating create flow. All four stories share the same auth model (D4) and the same frontend patterns already proven in the interaction and employee modules.

## Goals / Non-Goals

**Goals:**
- Add `PUT /api/tasks/{id}` and `DELETE /api/tasks/{id}` to the backend following the existing Interaction module patterns
- Add "Reopen" button using the already-working PATCH status endpoint
- Introduce two new modal components (`TaskEditModalComponent`, `CreateTaskModalComponent`) that follow the `EmployeeFormModalComponent` / `InteractionFormModalComponent` pattern
- Keep all existing routes and endpoints unchanged

**Non-Goals:**
- Assignee management or RBAC beyond D4
- Soft delete or audit history
- Bulk operations

## Decisions

### Backend: follow InteractionServiceImpl exactly for auth + error flow

`InteractionServiceImpl.delete()` uses `EntityNotFoundException` → 404 and `ForbiddenOperationException` → 403 via `GlobalExceptionHandler`. The task service already uses this pattern for `updateStatus`. Both new methods will follow it.

- `update`: creator OR subject may edit (D4, same as status update); loads via `findById` with `@EntityGraph` to avoid lazy-loading outside transaction
- `delete`: creator only (irreversible); same load-then-check pattern, then `deleteById`

Alternative (Spring Security `@PreAuthorize`): rejected — the project has no method-security config and the service-layer check is already the established pattern.

### Backend: single `UpdateTaskRequest` DTO (no partial-update)

A `PUT` with a full body is simpler and matches the existing `CreateStandaloneTaskRequest` shape. Partial PATCH for individual fields is out of scope (D6).

### Frontend: shared `app-modal` wrapper, signal-driven open state

All modals in the app follow the pattern:
- Parent owns an `open` signal (or a `editingTask` signal that doubles as the open flag)
- Modal resets its reactive form via `effect(() => { if (open()) { patchValue(...) } })`
- Modal emits `saved` / `closed`; parent updates the local signal array and closes the modal

`TaskEditModalComponent` mirrors `EmployeeFormModalComponent`.
`CreateTaskModalComponent` mirrors `InteractionFormModalComponent` (but simpler — no interaction reference).

### TSP-48: keep `/tasks/new` route, replace navigation with modal

The standalone `CreateTaskComponent` page stays registered at `/tasks/new` for backwards compat (e.g. deep links from notifications). The "New task" buttons in `my-tasks` and `tasks-section` are changed from `routerLink` to `(click)="openCreateModal()"`.

### Frontend loading-state signals

Follow `markingDoneId: WritableSignal<number | null>` pattern:
- `reopeningId` for TSP-46
- `deletingId` for TSP-51
- `editingTask: WritableSignal<Task | null>` for TSP-47 (null = modal closed; task = modal open with that task)
- `createModalOpen: WritableSignal<boolean>` for TSP-48

## Risks / Trade-offs

- [Browser `confirm()`] Blocks the JS thread; acceptable for a POC but would be replaced with an in-app modal in production → Mitigation: matches existing interaction delete; note in code comment
- [Employee select in modals] Both modals need the employee list for the assignee picker; they'll inject `EmployeeService.getAll()` on init, same as `CreateTaskComponent` already does → Mitigation: no extra backend calls, reuses existing endpoint
