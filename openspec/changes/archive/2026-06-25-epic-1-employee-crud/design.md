## Context

The `employee` module currently serves authentication only: the `Employee` entity holds identity fields (`firstName`, `lastName`, `email`, `passwordHash`) and the module exposes two auth endpoints (`POST /api/auth/login`, `GET /api/auth/me`). No CRUD operations exist, so it is impossible to onboard employees or maintain their records without direct database access.

Epic 1 extends this module to support the full employee lifecycle while keeping the auth slice intact. The new profile fields (`jobTitle`, `department`, `phone`) and soft-archive flag are additive — existing auth code is untouched.

## Goals / Non-Goals

**Goals:**
- REST CRUD for employees: create, get profile, list, search by name, update, soft-archive.
- Extended entity fields: `jobTitle`, `department`, `phone` (nullable), `archived` (boolean, default false).
- New DTOs that keep `passwordHash` out of API responses.
- Expanded `EmployeeService` interface, impl, and repository, following the existing module structure.
- New `EmployeeController` in the `employee` module.
- Angular feature: `EmployeeService`, list, form, and profile components; routes under `/employees`.
- Full unit + integration tests (backend) and Vitest component/service tests (frontend).

**Non-Goals:**
- Pagination (D6 — out of scope for POC).
- RBAC or role-based access control beyond D4 (any authenticated user can CRUD employees).
- Flyway migrations — the project currently uses Hibernate `ddl-auto=update`; new columns are added automatically.
- Account self-service or password change.
- Viewing archived employee history through a dedicated archived list view (archive sets `archived=true`; the profile remains accessible by direct URL).

## Decisions

### D-1: Extend the existing `Employee` entity rather than creating a new entity
Adding `jobTitle`, `department`, `phone`, and `archived` directly to `Employee` is simpler than a separate `EmployeeProfile` entity. The fields are always fetched together and there is no many-to-one relationship to model. A second entity would add a join with no benefit at POC scale.

*Alternative considered:* `EmployeeProfile` one-to-one — rejected as premature abstraction.

### D-2: Soft-archive via `archived` boolean on entity (not a status enum)
Archive is a binary state (active / retired). An enum would be needed only if more states were planned (e.g., on-leave, suspended) — out of scope per D6. A boolean is simpler to query and filter.

*Alternative considered:* `status` enum — rejected; D6 rules out future states for POC.

### D-3: `EmployeeProfileResponse` DTO distinct from `EmployeeResponse`
The existing `EmployeeResponse` (used by auth) has `id`, `email`, `firstName`, `lastName`. The new profile response adds `jobTitle`, `department`, `phone`, `archived`. Rather than mutating the auth DTO (which could break the auth spec), a separate `EmployeeProfileResponse` record is introduced. Auth endpoints keep returning `EmployeeResponse`.

### D-4: Name search via `ILIKE` in a derived Spring Data query
A simple `%query%` name search against `firstName` and `lastName` is sufficient for POC. No full-text index or Elasticsearch is needed at this scale. The derived query method name is verbose but avoids a custom `@Query` for the happy path; if it becomes unwieldy a `@Query` with JPQL will be used instead.

### D-5: Angular form component shared between create and edit
A single `EmployeeFormComponent` driven by an optional `id` input signal handles both flows. When `id` is absent the form POSTs; when present it GETs the current record, pre-fills, and PUTs on save. This avoids duplicating form logic across two components.

## Risks / Trade-offs

- **[Risk] Duplicate email on create** → The database unique constraint on `email` will surface as a `DataIntegrityViolationException`. The controller translates this to HTTP 409 Conflict. An integration test covers this path.
- **[Risk] Archived employee referenced by other modules** → Later epics (interactions, tasks, portfolio) will reference employees by id. Archiving does not delete the record, so foreign-key references remain valid. Archived employees are simply excluded from the default list; their profile is still reachable by direct URL.
- **[Risk] Schema drift** — `ddl-auto=update` is used in dev; `data.sql` seeds new nullable columns for existing test users. If a future environment uses `ddl-auto=validate` the migration must be applied manually. Acceptable trade-off for a POC.
