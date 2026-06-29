## 1. Backend scaffold

- [x] 1.1 Create the `interaction` module package structure under `com.psybergate.staff_engagement.interaction`.
- [x] 1.2 Add the `Interaction` JPA entity with `id`, `author_id`, `subject_id`, `note`, `type`, and `date` fields.
- [x] 1.3 Create the `InteractionType` enum with values NOTE, CALL, MEETING, EMAIL.
- [x] 1.4 Create the Flyway migration `V<next>__create_interaction_table.sql`.
- [x] 1.5 Create `InteractionRepository` extending `JpaRepository`.

## 2. Backend service layer

- [x] 2.1 Create `InteractionService` interface with methods: create, update, delete, findById, findBySubject.
- [x] 2.2 Implement `InteractionServiceImpl` resolving `author = current employee`.
- [x] 2.3 Enforce author-only edit/delete in `InteractionServiceImpl`.
- [x] 2.4 Create `InteractionMapper` to map between entity and DTOs.
- [x] 2.5 Write unit tests for `InteractionServiceImpl` covering create, self-interaction, edit by author, edit by non-author, delete by non-author, missing note validation.

## 3. Backend API layer

- [x] 3.1 Create `InteractionRequestDto` with Bean Validation (`@NotBlank` on note, `@NotNull` on subjectId, type, date).
- [x] 3.2 Create `InteractionResponseDto` for API responses.
- [x] 3.3 Create `InteractionController` with endpoints:
  - `POST /api/interactions`
  - `GET /api/interactions?subjectId={id}`
  - `PUT /api/interactions/{id}`
  - `DELETE /api/interactions/{id}`
- [x] 3.4 Write integration tests (`*IT`) for all endpoints using Testcontainers PostgreSQL.
- [x] 3.5 Test edge cases: missing note, non-existent subject, non-author update/delete, self-interaction.

## 4. Frontend

- [x] 4.1 Create `Interaction` domain model and `InteractionService` in Angular.
- [x] 4.2 Create the interaction log form component with reactive form validation.
- [x] 4.3 Create the employee interaction timeline component.
- [x] 4.4 Add routes and navigation for the new components.
- [x] 4.5 Write Vitest unit tests for components and service.
- [x] 4.6 Add a Playwright e2e smoke test for logging and viewing an interaction.

## 5. Final verification

- [x] 5.1 Run backend tests (`./mvnw verify`) and ensure they pass.
- [x] 5.2 Run frontend tests (`npm run test:ci`) and ensure they pass.
- [x] 5.3 Run Playwright e2e smoke tests.
- [x] 5.4 Update CLAUDE.md if any conventions changed (likely not needed).

## 6. Reviewer feedback & acceptance tests

- [x] 6.1 Resolve Spring Boot PR reviewer blockers and selected significant/minor issues.
- [x] 6.2 Resolve Angular PR reviewer must-fix and minor polish.
- [x] 6.3 Re-run backend `./mvnw verify` successfully.
- [x] 6.4 Re-run frontend `npm run test:ci` successfully.
- [x] 6.5 Add Cucumber BDD acceptance tests for employee and interaction modules.
- [x] 6.6 Run Cucumber acceptance suite successfully.
- [x] 6.7 Update tasks.md to reflect completed work.
