## Context

The `interaction` module already provides `POST /api/interactions`, `GET /api/interactions?subjectId={id}`, `GET /api/interactions/{id}`, `PUT /api/interactions/{id}`, and `DELETE /api/interactions/{id}`. The frontend timeline page renders the list for a selected employee. TSP-23 adds optional server-side filtering of that list by `type`, `authorId`, and `date`.

## Goals / Non-Goals

**Goals**
- Extend `GET /api/interactions` with optional `type`, `authorId`, and `date` query parameters.
- Apply filters in the repository layer so only matching rows are returned.
- Add a filter bar to the Angular timeline component.
- Keep the endpoint backward-compatible when no filters are provided.
- Cover filtering logic with unit and integration tests, plus a Playwright e2e scenario.

**Non-Goals**
- Pagination, free-text search, or range filtering (e.g., date ranges) are out of scope for the POC per D6.
- No new persistence model or schema changes are needed.
- No RBAC changes; any authenticated user may still view any employee's timeline.

## Decisions

### Decision 1: Use a single dynamic query method in the repository

Implement filtering with a Spring Data JPA `Specification` (or derived query with nullable parameters) in `InteractionRepository`. This keeps the query logic in one place and avoids N+1 queries.

- **Rationale**: The number of filter combinations is small (type, authorId, date) and the result set is expected to be modest for a POC. A `Specification` avoids method explosion while remaining testable.
- **Alternative considered**: Multiple derived query methods (`findBySubjectIdAndTypeAndAuthorIdAndDateOrderByDateDesc`). Rejected because it produces combinatorial method signatures and is harder to maintain.

### Decision 2: Keep `subjectId` required in the controller

The existing timeline is scoped to a subject. Filtering still requires `subjectId`; the filter parameters only narrow the subject's timeline.

- **Rationale**: Maintains the existing mental model and URL contract. A global "all interactions" view is not requested by the ticket.

### Decision 3: Author filter uses employee id, not email

The `authorId` query parameter accepts the author's employee id.

- **Rationale**: The response DTO already exposes `author.id`, so the frontend can filter using a value it already has. Email would require an extra lookup and is less stable in URLs.

### Decision 4: Date filter matches a single day

The `date` parameter is an ISO date (`YYYY-MM-DD`) and matches interactions on that exact date.

- **Rationale**: Matches the acceptance criteria wording and keeps the UI simple (a single date input). Date ranges are out of scope.

### Decision 5: Filter state lives in the timeline component

Use local reactive form controls or signals in `InteractionTimelineComponent` for the filter values, and call `InteractionService.findBySubject(subjectId, filters)` when the user applies them.

- **Rationale**: Filter state is transient and tightly coupled to the timeline view. No global state or query-param synchronization is required for the POC.

## Risks / Trade-offs

- **[Risk] Invalid `type` enum values produce 400 instead of being ignored.** → Mitigation: parse the enum defensively in the service/controller; return HTTP 400 only for truly invalid values, otherwise treat as no filter.
- **[Risk] `Specification` query is less obvious to future maintainers than a derived method.** → Mitigation: add a focused unit test for the repository/service that exercises each combination.
- **[Risk] Adding a date filter without an index on `(subject_id, date)` could be slow for large timelines.** → Mitigation: timeline sizes are expected to be small in the POC; no index added now, but the migration is reversible if performance becomes a concern.

## Migration Plan

No migration required. The change is purely additive:
1. Deploy backend with updated controller/service/repository.
2. Deploy frontend with updated timeline component.
3. Existing clients calling `GET /api/interactions?subjectId={id}` continue to work unchanged.

## Open Questions

None at this time.
