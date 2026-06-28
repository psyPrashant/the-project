## Why

The interaction timeline quickly becomes hard to scan once an employee accumulates many notes, calls, meetings, and emails. Users need a lightweight way to narrow the timeline by interaction type, author, or date so they can find relevant history without scrolling through unrelated entries.

## What Changes

- Extend the existing interaction timeline endpoint with optional query parameters for `type`, `authorId`, and `date`.
- Add author filtering by the current user's identity for a "my interactions" view.
- Update the Angular timeline component with a filter bar that submits the chosen filters to the backend.
- Keep filtering additive and optional: an empty filter set returns the full timeline as before.
- Cover backend query logic, component behavior, and e2e filter scenarios with tests.

## Capabilities

### New Capabilities

- `filter-interactions`: Filter an employee's interaction timeline by type, author, and/or date via query parameters, with a corresponding filter UI.

### Modified Capabilities

- None at the spec level. The `filter-interactions` capability extends the existing `view-interaction-timeline` behavior with optional query parameters; the base timeline contract remains unchanged when no filters are supplied.

## Impact

- Backend: `InteractionController.GET /api/interactions` gains optional `type`, `authorId`, and `date` query params; `InteractionService` and `InteractionRepository` add filtered query methods.
- Frontend: `InteractionTimelineComponent` gains filter controls and binds them to the `InteractionService`.
- Depends on the existing `interaction` module and current-user identity (employee) support.
- No breaking API changes; the endpoint remains backward-compatible when no filters are provided.
