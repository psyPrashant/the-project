## 1. Backend scaffold

- [ ] 1.1 Create the `interaction` module package structure under `com.psybergate.staff_engagement.interaction`.
- [ ] 1.2 Add the `Interaction` JPA entity with `id`, `author_id`, `subject_id`, `note`, `type`, and `date` fields.
- [ ] 1.3 Create the `InteractionType` enum with values NOTE, CALL, MEETING, EMAIL.
- [ ] 1.4 Create the Flyway migration `V<next>__create_interaction_table.sql`.
- [ ] 1.5 Create `InteractionRepository` extending `JpaRepository`.

## 2. Backend service layer

- [ ] 2.1 Create `InteractionService` interface with methods: create, update, delete, findById, findBySubject.
- [ ] 2.2 Implement `InteractionServiceImpl` resolving `author = current employee`.
- [ ] 2.3 Enforce author-only edit/delete in `InteractionServiceImpl`.
- [ ] 2.4 Create `InteractionMapper` to map between entity and DTOs.
- [ ] 2.5 Write unit tests for `InteractionServiceImpl` covering create, self-interaction, edit by author, edit by non-author, delete by non-author, missing note validation.

## 3. Backend API layer

- [ ] 3.1 Create `InteractionRequestDto` with Bean Validation (`@NotBlank` on note, `@NotNull` on subjectId, type, date).
- [ ] 3.2 Create `InteractionResponseDto` for API responses.
- [ ] 3.3 Create `InteractionController` with endpoints:
  - `POST /api/interactions`
  - `GET /api/interactions?subjectId={id}`
  - `PUT /api/interactions/{id}`
  - `DELETE /api/interactions/{id}`
- [ ] 3.4 Write integration tests (`*IT`) for all endpoints using Testcontainers PostgreSQL.
- [ ] 3.5 Test edge cases: missing note, non-existent subject, non-author update/delete, self-interaction.

## 4. Frontend

- [ ] 4.1 Create `Interaction` domain model and `InteractionService` in Angular.
- [ ] 4.2 Create the interaction log form component with reactive form validation.
- [ ] 4.3 Create the employee interaction timeline component.
- [ ] 4.4 Add routes and navigation for the new components.
- [ ] 4.5 Write Vitest unit tests for components and service.
- [ ] 4.6 Add a Playwright e2e smoke test for logging and viewing an interaction.

## 5. Final verification

- [ ] 5.1 Run backend tests (`./mvnw verify`) and ensure they pass.
- [ ] 5.2 Run frontend tests (`npm run test:ci`) and ensure they pass.
- [ ] 5.3 Run Playwright e2e smoke tests.
- [ ] 5.4 Update CLAUDE.md if any conventions changed (likely not needed).
