## 1. Database Migration

- [x] 1.1 Find the latest Flyway migration version number in `staff-engagement-backend/src/main/resources/db/migration/`
- [x] 1.2 Create `V<next>__create_task_table.sql` with columns: `id`, `title`, `description`, `status` (VARCHAR, default 'OPEN'), `relates_to_id` (FK → employee), `created_by_id` (FK → employee), `from_interaction_id` (FK → interaction, nullable), `due_date` (DATE, nullable), `assignee_id` (FK → employee, nullable), `created_at`, `updated_at`

## 2. Backend — Entity & Repository

- [x] 2.1 Create `TaskStatus` enum (`OPEN`, `DONE`) under `com.psybergate.staff_engagement.task.model`
- [x] 2.2 Create `Task` JPA entity with all fields, Lombok annotations (`@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`), and JPA column mappings
- [x] 2.3 Create `TaskRepository` extending `JpaRepository<Task, UUID>` with a query method for `findByRelatesToIdOrAssigneeId`

## 3. Backend — DTOs

- [x] 3.1 Create `CreateTaskFromInteractionRequest` DTO with `@Valid` annotations (`title` required, `interactionId` required, optional `description`, `dueDate`, `assigneeId`)
- [x] 3.2 Create `CreateStandaloneTaskRequest` DTO with `@Valid` annotations (`title` required, `relatesToId` required, optional `description`, `dueDate`, `assigneeId`)
- [x] 3.3 Create `UpdateTaskStatusRequest` DTO (`status` required, must be valid `TaskStatus`)
- [x] 3.4 Create `TaskResponse` DTO covering all task fields including nested employee references

## 4. Backend — Service

- [x] 4.1 Create `TaskService` interface with methods: `createFromInteraction`, `createStandalone`, `getMyTasks`, `updateStatus`
- [x] 4.2 Create `TaskServiceImpl` implementing `TaskService` using `@RequiredArgsConstructor`; inject `TaskRepository`, `EmployeeService`, `InteractionService`
- [x] 4.3 Implement `createFromInteraction`: load interaction via `InteractionService`, derive `relatesTo` from interaction subject, set `createdBy` = current user, save
- [x] 4.4 Implement `createStandalone`: validate `relatesTo` employee exists via `EmployeeService`, set `createdBy` = current user, `fromInteraction` null, save
- [x] 4.5 Implement `getMyTasks`: query `findByRelatesToIdOrAssigneeId` with current user's employee ID
- [x] 4.6 Implement `updateStatus`: load task, check D4 permission (subject or creator = current user), throw `403` if neither, update status, save
- [x] 4.7 Validate `assigneeId` (if provided) exists via `EmployeeService` in both create methods

## 5. Backend — Controller

- [x] 5.1 Create `TaskController` at `/api/tasks` with `@RequiredArgsConstructor`, `@RestController`, `@RequestMapping`
- [x] 5.2 Implement `POST /api/tasks/from-interaction` — accepts `CreateTaskFromInteractionRequest`, returns `201 TaskResponse`
- [x] 5.3 Implement `POST /api/tasks` — accepts `CreateStandaloneTaskRequest`, returns `201 TaskResponse`
- [x] 5.4 Implement `GET /api/tasks/mine` — returns `200 List<TaskResponse>` for current user
- [x] 5.5 Implement `PATCH /api/tasks/{id}/status` — accepts `UpdateTaskStatusRequest`, returns `200 TaskResponse`

## 6. Backend — Tests

- [x] 6.1 Write `TaskServiceImplTest` (Mockito) covering: create-from-interaction happy path, create-standalone happy path, getMyTasks returns correct subset, updateStatus by subject succeeds, updateStatus by creator succeeds, updateStatus by unrelated user throws 403, non-existent interaction throws 404, non-existent employee throws 404
- [x] 6.2 Write `TaskControllerIT` (extends `IntegrationTestBase`, Testcontainers) covering: POST from-interaction 201, POST standalone 201, GET mine filters correctly, PATCH status 200, PATCH status 403 for unrelated user, POST with missing title 400, POST with non-existent interaction 404

## 7. Frontend — Task Service

- [x] 7.1 Create `TaskService` (`providedIn: 'root'`) with methods: `createFromInteraction`, `createStandalone`, `getMyTasks`, `updateStatus` — all calling the backend API via `HttpClient`
- [x] 7.2 Define `Task`, `CreateTaskFromInteractionRequest`, `CreateStandaloneTaskRequest`, `UpdateTaskStatusRequest` TypeScript interfaces/models

## 8. Frontend — My Tasks Page

- [x] 8.1 Create standalone `MyTasksComponent` with `OnPush` change detection; load tasks via `TaskService.getMyTasks()` into a signal
- [x] 8.2 Display tasks in a list grouped or labelled by status (OPEN / DONE) using `@for` and `@if`
- [x] 8.3 Add a "Mark done" action button on each OPEN task that calls `updateStatus` and refreshes the list signal
- [x] 8.4 Register route `/tasks/mine` and add a nav link to the main navigation

## 9. Frontend — Create Task Forms

- [x] 9.1 Create standalone `CreateStandaloneTaskComponent` with a reactive form (title required, employee lookup/select, optional description, dueDate, assignee)
- [x] 9.2 Create standalone `CreateTaskFromInteractionComponent`; pre-populate `interactionId` from route param; form has title, optional description, dueDate, assignee
- [x] 9.3 Register routes `/tasks/new` (standalone) and `/interactions/:id/create-task` (from interaction)
- [x] 9.4 Add "Create follow-up task" button to the interaction detail view that navigates to `/interactions/:id/create-task`

## 10. Frontend — Tests

- [x] 10.1 Write Vitest unit tests for `TaskService` (mock `HttpClient`): each method maps request/response correctly
- [x] 10.2 Write Vitest unit tests for `MyTasksComponent`: renders task list, mark-done calls service, empty state displayed
- [x] 10.3 Write Vitest unit tests for `CreateStandaloneTaskComponent`: form validation, submit dispatches correct payload
- [x] 10.4 Write Playwright e2e smoke test: create a standalone task, verify it appears on My Tasks page, mark it done, verify it shows as DONE
