# The Staff Project

Staff engagement platform for managing employees, their skills, interactions, tasks, and portfolios.

## Stack

| Layer      | Technology                                                        |
|------------|-------------------------------------------------------------------|
| Backend    | Spring Boot 3.5, Java 17, Maven, Lombok                          |
| Frontend   | Angular 21, TypeScript 5.9, Tailwind CSS 4, Vitest               |
| Database   | PostgreSQL 17 (Docker), H2 in-memory (tests)                     |
| Tooling    | Node 24, npm 11, Docker Compose, GitHub Actions CI                |

Base package: `com.psybergate.staff_engagement`

## Architecture

The backend is a **modular monolith** — a single deployable, internally organised into domain modules:

- `employee` — core employee records
- `interaction` — logged interactions between staff
- `task` — follow-up tasks arising from interactions
- `portfolio` — employee project portfolios
- `skills` — canonical skill definitions and employee-skill links

Each module follows standard layered structure:

```
Controller  →  Service (interface)  →  ServiceImpl  →  Repository
```

Cross-module calls go through **service interfaces**, never repositories. This keeps module boundaries clean and the monolith splittable later.

## Design Decisions

- **D1 — Skill experience:** `years` is user-entered; `projectCount` is derived from `EmployeeSkill ↔ Project` links (never stored). Linking projects is core, not an extension.
- **D2 — Task model:** `relatesTo` = subject Employee ("my tasks" = `relatesTo = me`). `createdBy` = provenance. `fromInteraction` = optional link to spawning interaction. `assignee` (extension) = who should action it, distinct from `relatesTo`.
- **D3 — Every user is an Employee.** Auth resolves the caller to an Employee. Logging against yourself is allowed.
- **D4 — Permissions (POC):** Any authenticated user may create/edit/view employees and portfolios. Interaction edit/delete is restricted to the author. Tasks may be updated by subject or creator. No RBAC beyond this.
- **D5 — Skills are canonical.** A `Skill` is a deduplicated reference entity; never duplicated as free text.
- **D6 — Out of scope for POC:** Pagination, RBAC, account self-service, audit history beyond `createdBy`/timestamps, notifications.

## Conventions

### General
- Follow **clean OOP** and **SOLID** principles across the entire codebase.
- Apply design patterns (Strategy, Factory, Observer, etc.) where they naturally fit — do not force them.
- Favour composition over inheritance.
- Keep classes and methods small, focused on a single responsibility.

### Backend (Java / Spring Boot)
- Use constructor injection (Lombok `@RequiredArgsConstructor`) — never field injection.
- Service layer is always an interface + implementation pair.
- Repository layer extends Spring Data JPA interfaces.
- Entities use JPA annotations; Lombok for boilerplate (`@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`).
- Validation at the controller boundary (`@Valid`, Bean Validation annotations).
- Use DTOs for API request/response; never expose entities directly.
- Test with JUnit 5 + Mockito for unit tests; `@SpringBootTest` + H2 for integration tests in CI.
- `spring.jpa.open-in-view=false` — no lazy-loading outside transactions.

### Frontend (Angular)
- See `staff-engagement-frontend/.claude/CLAUDE.md` for Angular-specific conventions.
- Standalone components only (no NgModules).
- Signals for state, `computed()` for derived state, `OnPush` change detection.
- Native control flow (`@if`, `@for`, `@switch`).
- `inject()` function instead of constructor injection.
- `input()` / `output()` functions instead of decorators.
- Reactive forms over template-driven forms.

## Running Locally

```bash
# Start PostgreSQL
docker compose up -d db

# Backend (from staff-engagement-backend/)
./mvnw spring-boot:run

# Frontend (from staff-engagement-frontend/)
npm install
npm start
```

Backend: http://localhost:8080 | Frontend: http://localhost:4200

## CI Pipeline

GitHub Actions runs on push/PR to `main`:
- **Frontend job:** `npm ci` → `npm run build --configuration production` → `npm test`
- **Backend job:** JDK 17 (Temurin) → `./mvnw -B -ntp verify`

Both jobs must pass to merge.

## Definition of Done

1. Unit + integration tests green; backend integration tests run against H2 in CI (Testcontainers planned).
2. At least one negative/edge path covered wherever there is validation, branching, or a permission rule.
3. e2e smoke test (Playwright/Cypress) for any new user-facing flow.
4. CI green; a failing test reds the pipeline and blocks merge.
5. PR passes the Claude Code review agent with no unaddressed findings.

## Project Structure

```
the-project/
├── CLAUDE.md                          # this file
├── docker-compose.yml                 # PostgreSQL + backend + frontend
├── .github/workflows/ci.yml          # CI pipeline
├── staff-engagement-backend/          # Spring Boot API
│   ├── pom.xml
│   └── src/main/java/com/psybergate/staff_engagement/
└── staff-engagement-frontend/         # Angular SPA
    ├── package.json
    └── src/app/
```
