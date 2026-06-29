## Why

The Staff Engagement POC needs the ability to log interactions between employees. Without a structured interaction record, notes about engagements remain in personal notebooks or informal channels, making follow-up, accountability, and team history impossible. This epic introduces the interaction domain so employees can record, view, and manage their engagements with colleagues.

## What Changes

- Add a new `interaction` module to the backend modular monolith.
- Introduce an `Interaction` entity linking an `author` (current user) and a `subject` employee.
- Expose REST endpoints to create, view, edit, and delete interactions.
- Enforce ownership rules: edit/delete restricted to the interaction author.
- Allow self-interactions per design decision D3.
- Add validation ensuring a note body is required.
- Build the corresponding Angular feature to log and view interactions.
- Cover all paths with unit and integration tests.

## Capabilities

### New Capabilities

- `log-interaction`: Record an interaction against an employee (TSP-20).
- `view-interaction-timeline`: View an employee's interaction history (TSP-21).
- `edit-delete-own-interaction`: Edit or delete interactions authored by the current user (TSP-22).
- `filter-interactions`: Filter an employee's interaction timeline (TSP-23, extension).

### Modified Capabilities

- None. This epic only introduces new behavior; existing employee and authentication capabilities are consumed but not altered at the requirement level.

## Impact

- Backend: new `interaction` module, new database table, new REST endpoints, new service/repository layer.
- Frontend: new interaction pages/forms, updates to employee profile to show timeline.
- Depends on the completed F6 authentication/current-user identity work.
- No breaking API changes; all additions are additive.
