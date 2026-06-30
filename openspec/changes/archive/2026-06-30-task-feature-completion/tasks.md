## 1. Backend — Edit Task (TSP-47)

- [ ] 1.1 Create `UpdateTaskRequest` DTO record with `@NotBlank @Size(max=255) String title`, `String description`, `LocalDate dueDate`, `Long assigneeId` in `task/dto/`
- [ ] 1.2 Add `TaskResponse update(Long id, UpdateTaskRequest request, Employee currentEmployee)` to `TaskService` interface
- [ ] 1.3 Implement `update()` in `TaskServiceImpl`: find by id (404), check creator OR subject (403), set fields, save, return mapped response
- [ ] 1.4 Add `@PutMapping("/{id}")` to `TaskController` returning 200 `TaskResponse`
- [ ] 1.5 Add unit tests in `TaskServiceImplTest` for update — happy path (creator), happy path (subject), 403 (unrelated user), 404 (not found), 400 (blank title)
- [ ] 1.6 Add integration tests in `TaskIT` for `PUT /api/tasks/{id}` — 200, 403, 404, 400 cases

## 2. Backend — Delete Task (TSP-51)

- [ ] 2.1 Add `void delete(Long id, Employee currentEmployee)` to `TaskService` interface
- [ ] 2.2 Implement `delete()` in `TaskServiceImpl`: find by id (404), check creator only (403), delete — mirror `InteractionServiceImpl.delete()`
- [ ] 2.3 Add `@DeleteMapping("/{id}")` to `TaskController` returning 204 void
- [ ] 2.4 Add unit tests in `TaskServiceImplTest` for delete — happy path (creator), 403 (subject but not creator), 403 (unrelated user), 404 (not found)
- [ ] 2.5 Add integration tests in `TaskIT` for `DELETE /api/tasks/{id}` — 204, 403, 404 cases

## 3. Frontend — Models and Service

- [ ] 3.1 Add `UpdateTaskRequest` interface to `task.models.ts` (`title: string; description?: string; dueDate?: string; assigneeId?: number`)
- [ ] 3.2 Add `update(id: number, req: UpdateTaskRequest): Observable<Task>` to `task.service.ts` calling `PUT /api/tasks/{id}`
- [ ] 3.3 Add `delete(id: number): Observable<void>` to `task.service.ts` calling `DELETE /api/tasks/{id}`

## 4. Frontend — Toggle Task Status / Reopen (TSP-46)

- [ ] 4.1 Add `reopeningId` signal (`WritableSignal<number | null>`) to `MyTasksComponent`; implement `reopenTask(task)` calling `updateStatus(id, { status: 'OPEN' })` and updating local signal array
- [ ] 4.2 Add "Reopen" button to `my-tasks.html` done-tasks section, guarded by `canMarkDone(task)`, using `reopeningId` for loading state
- [ ] 4.3 Add same `reopeningId` signal and `reopenTask()` to `TasksSectionComponent`; add "Reopen" button to `tasks-section.html` with same permission guard
- [ ] 4.4 Update `my-tasks.spec.ts` — tests for Reopen button visibility (creator, subject, unrelated), successful reopen moves task to Open section
- [ ] 4.5 Update `tasks-section.spec.ts` — same tests for Reopen button

## 5. Frontend — Edit Task Modal (TSP-47)

- [ ] 5.1 Create `tasks/task-edit-modal/task-edit-modal.ts` — standalone component with `open = input<boolean>()`, `task = input<Task | null>()`, `saved = output<Task>()`, `closed = output<void>()`; reactive form with title (required), description, dueDate, assigneeId; `effect()` to patch form when `open` becomes true; calls `taskService.update()`
- [ ] 5.2 Create `tasks/task-edit-modal/task-edit-modal.html` — uses `<app-modal>` wrapper with employee select for assignee
- [ ] 5.3 Add `editingTask = signal<Task | null>(null)` to `MyTasksComponent`; add `openEditModal(task)` / `closeEditModal()` methods; handle `saved` event to update task in local array
- [ ] 5.4 Add pencil icon button to `my-tasks.html` task cards, rendered only when `canEdit(task)` (creator or subject); embed `<app-task-edit-modal>`
- [ ] 5.5 Add same `editingTask` signal and modal trigger to `TasksSectionComponent` and `tasks-section.html`
- [ ] 5.6 Add `canEdit(task)` helper to both components (creator OR subject — same logic as `canMarkDone`)
- [ ] 5.7 Create `task-edit-modal.spec.ts` — form pre-population, save calls service, cancel closes, save disabled when title blank
- [ ] 5.8 Update `my-tasks.spec.ts` and `tasks-section.spec.ts` for edit icon visibility and modal trigger

## 6. Frontend — Create Task Modal (TSP-48)

- [ ] 6.1 Create `tasks/create-task-modal/create-task-modal.ts` — standalone component with `relatesToId = input<number | undefined>()`, `open = input<boolean>()`, `saved = output<Task>()`, `closed = output<void>()`; when `relatesToId` is set, pre-fill and disable the "Relates to" select; calls `taskService.createStandalone()`
- [ ] 6.2 Create `tasks/create-task-modal/create-task-modal.html` — uses `<app-modal>` wrapper with same fields as `CreateTaskComponent`
- [ ] 6.3 In `MyTasksComponent`: add `createModalOpen = signal(false)`; replace `routerLink="/tasks/new"` with `(click)="createModalOpen.set(true)"`; handle `saved` by prepending task to local array; embed `<app-create-task-modal>`
- [ ] 6.4 In `TasksSectionComponent`: add `createModalOpen = signal(false)`; replace `routerLink` with `(click)="createModalOpen.set(true)"`; pass `[relatesToId]="subjectId()"`; handle `saved` by appending to local array
- [ ] 6.5 Create `create-task-modal.spec.ts` — relatesToId pre-fills and locks field, no-id leaves field editable, save adds task to list, cancel closes modal
- [ ] 6.6 Update `my-tasks.spec.ts` and `tasks-section.spec.ts` for modal open/close instead of navigation

## 7. Frontend — Delete Task (TSP-51)

- [ ] 7.1 Add `deletingId = signal<number | null>(null)` to `MyTasksComponent`; implement `deleteTask(task)` — `confirm()` dialog, on confirmed call `taskService.delete(id)` and remove from local signal array
- [ ] 7.2 Add trash icon button to `my-tasks.html` rendered only when `isCreator(task)` (current user is creator); disabled while `deletingId() === task.id`
- [ ] 7.3 Add same `deletingId` signal and `deleteTask()` to `TasksSectionComponent`; add trash icon to `tasks-section.html` with same guard
- [ ] 7.4 Update `my-tasks.spec.ts` — trash icon visible to creator only, confirm dialog called, task removed on confirm, no call on cancel
- [ ] 7.5 Update `tasks-section.spec.ts` — same tests

## 8. E2E Tests

- [ ] 8.1 Update `e2e/task.spec.ts` — add test for Reopen flow (mark done → reopen → task back in Open section)
- [ ] 8.2 Update `e2e/task.spec.ts` — add test for Edit flow (open edit modal, change title, save, card shows new title)
- [ ] 8.3 Update `e2e/task.spec.ts` — add test for Create via modal from profile page (no navigation away)
- [ ] 8.4 Update `e2e/task.spec.ts` — add test for Delete flow (click trash, confirm, task removed)

## 9. Verification

- [ ] 9.1 Run `./mvnw verify` in `staff-engagement-backend/` — all unit + IT tests green
- [ ] 9.2 Run `npm test` in `staff-engagement-frontend/` — all Vitest specs green
- [ ] 9.3 Run `npm run e2e` in `staff-engagement-frontend/` — Playwright tests green
