## 1. Backend filtering API

- [x] 1.1 Add `InteractionFilter` record/DTO in the `interaction` module to carry optional `type`, `authorId`, and `date` filter values.
- [x] 1.2 Extend `InteractionRepository` with a query method or `JpaSpecificationExecutor` plus a `Specification` that filters by `subjectId` and applies optional `type`, `authorId`, and `date` predicates, ordering by `date` descending.
- [x] 1.3 Extend `InteractionService` interface with `findBySubject(Long subjectId, InteractionFilter filter)`.
- [x] 1.4 Implement `findBySubject` in `InteractionServiceImpl`, mapping results to `InteractionResponseDto`.
- [x] 1.5 Update `InteractionController.GET /api/interactions` to accept optional `type`, `authorId`, and `date` request parameters and delegate to the new service method.
- [x] 1.6 Add backend unit tests for `InteractionServiceImpl` covering each filter individually and combined filters.
- [x] 1.7 Add backend integration tests (`InteractionControllerIT` or similar) covering filtered timeline responses and backward-compatible unfiltered calls.

## 2. Frontend filter UI

- [x] 2.1 Update `InteractionService.findBySubject` to accept an optional filter object and append non-empty values as query parameters.
- [x] 2.2 Add `InteractionType` enum values to the frontend model if not already available.
- [x] 2.3 Add filter form controls to `InteractionTimelineComponent` (type dropdown, author search/select, date input) using reactive forms or signals.
- [x] 2.4 Wire the "Apply filters" action to call `InteractionService.findBySubject(subjectId, filters)` and refresh `interactions`.
- [x] 2.5 Add a "Reset" action that clears filters and reloads the full timeline.
- [x] 2.6 Update `InteractionTimelineComponent` unit tests to verify filter controls, apply action, reset action, and that unfiltered load still works.
- [x] 2.7 Update `InteractionService` unit tests to verify query parameter construction.

## 3. End-to-end and acceptance tests

- [x] 3.1 Add a Playwright e2e scenario that creates interactions of different types and authors, then filters by type and verifies only matching items appear.
- [x] 3.2 Add a Playwright e2e scenario that filters by date and verifies only matching items appear.
- [x] 3.3 (Optional) Add a Cucumber scenario for filtered timeline retrieval if it adds BDD coverage beyond existing tests.

## 4. Final verification

- [x] 4.1 Run `./mvnw verify` from `staff-engagement-backend/` and ensure all tests pass.
- [x] 4.2 Run `npm run test:ci` from `staff-engagement-frontend/` and ensure all tests pass.
- [x] 4.3 Run Playwright e2e tests (`npx playwright test`) and ensure they pass.
- [x] 4.4 Run Cucumber BDD tests if modified, and ensure they pass.
- [x] 4.5 Update `tasks.md` to mark completed tasks.

## 5. Archive and Jira update

- [x] 5.1 Apply and archive the OpenSpec change using `openspec-apply-change` and `openspec-archive-change`.
- [x] 5.2 Move Jira ticket TSP-23 to Testing/Review and add a verification summary comment.
