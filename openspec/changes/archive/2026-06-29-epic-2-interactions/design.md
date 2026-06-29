## Context

The Staff Engagement POC is a modular monolith with five domain modules: `employee`, `interaction`, `task`, `portfolio`, and `skills`. The `employee` and authentication (F6) capabilities are already implemented, providing a resolved current-user `Employee` for every authenticated request.

This epic introduces the `interaction` module and the foundational interaction lifecycle: an employee logs a note about an engagement with another employee, views that employee's timeline, and edits or deletes only their own entries.

## Goals / Non-Goals

**Goals:**
- Introduce the `interaction` backend module with entity, repository, service, and REST endpoints.
- Implement create, read, update, delete, and list operations for interactions.
- Enforce author-only edit/delete per design decision D4.
- Allow self-interactions per design decision D3.
- Add backend validation for required fields.
- Build the Angular feature to log and view interactions.
- Cover happy paths, permission violations, and validation errors with unit and integration tests.

**Non-Goals:**
- Pagination (D6 out of scope).
- Notifications, audit history beyond `createdBy`/timestamps (D6).
- Advanced RBAC beyond author/subject/creator ownership rules (D4).
- Rich text, attachments, or mentions in interaction notes.

## Decisions

### 1. Model `Interaction` as a first-class entity in its own module
**Rationale:** Keeps the modular monolith boundary clean. The `interaction` module owns `Interaction`, but it references `Employee` through the `employee` service interface (`EmployeeService`).

### 2. Use a dedicated `Interaction` JPA entity with `author_id` and `subject_id`
**Rationale:** Self-interactions are explicitly allowed (D3), so `author` and `subject` may point to the same employee. Storing both IDs directly on the entity is simple and query-friendly.

### 3. Resolve `author = current user` at the service layer
**Rationale:** The controller receives a subject and payload; the service sets `author` from the security context/current employee. This keeps the controller thin and avoids trusting client-provided author values.

### 4. Enforce author-only edit/delete in the service layer
**Rationale:** Centralizes the permission rule. The service checks the current employee against `Interaction.author` and throws an authorization exception before any mutation.

### 5. Use DTOs for API request/response and Bean Validation for required fields
**Rationale:** Matches project conventions — never expose entities directly, validate at the controller boundary.

### 6. Store `note`, `type`, and `date` on `Interaction`
**Rationale:** The Jira story and acceptance criteria explicitly call for these fields. `type` is a controlled value (e.g. NOTE, CALL, MEETING) represented as an enum or small varchar.

### 7. Frontend: standalone components, reactive forms, signals
**Rationale:** Aligns with `CLAUDE.md` and `staff-engagement-frontend/.claude/CLAUDE.md` conventions.

## Risks / Trade-offs

- **[Risk] No pagination on timeline could be slow for long-tenured employees.** → Mitigation: pagination is out of scope for the POC (D6); document this as a known limitation.
- **[Risk] Soft-delete vs hard-delete.** → Decision: hard-delete for the POC to keep the model simple. Audit history is also out of scope (D6).
- **[Risk] Self-interaction may confuse UX expectations.** → Mitigation: accepted per D3; no special UI treatment required unless user feedback indicates otherwise.
- **[Risk] Interaction type enum needs seed values.** → Mitigation: define minimal enum values (NOTE, CALL, MEETING, EMAIL) and allow extension later.

## Migration Plan

No production migration needed for the POC. A Flyway migration will create the `interaction` table when the module is introduced. Existing demo/seed data remains unaffected.
