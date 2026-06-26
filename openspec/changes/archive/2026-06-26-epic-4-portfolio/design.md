## Context

Epic 1 delivered the employee identity/profile slice. Epic 4 builds the first domain that hangs off an employee: the portfolio. The portfolio is conceptually a child of an employee and is composed of three independent sub-resources: education entries, projects, and public links.

## Goals / Non-Goals

**Goals:**
- REST CRUD for education, projects, and showcase links under `/api/employees/{employeeId}/portfolio`.
- Aggregated full-portfolio read endpoint.
- Angular portfolio view at `/employees/:id/portfolio` with inline add/edit/delete for each section.
- Validation (required fields, valid URLs) and not-found handling.
- Full unit + integration tests and BDD/mutation coverage.

**Non-Goals:**
- Skills section in the portfolio view (Epic 5, S7).
- Pagination (D6).
- File uploads / attachments for projects.
- Public/external portfolio sharing beyond authenticated in-app viewing.

## Decisions

### D-1: No aggregate `Portfolio` table
The portfolio is a read-model aggregate assembled at runtime from the three sub-resource tables. This avoids a mostly-empty aggregate table and keeps each section independently queryable.

*Alternative considered:* a `Portfolio` one-to-one with `Employee` — rejected as unnecessary indirection for a POC.

### D-2: `employeeId` stored as a plain `Long`, not a JPA relationship to `Employee`
Portfolio items store `employee_id` as a scalar column. The service validates that the employee exists via the published `EmployeeService` interface. This keeps the `portfolio` module decoupled from the `employee` module's entity/schema, preserving the modular monolith's splittability.

### D-3: `Project` lives in the `portfolio` module
Projects are portfolio-native per the epic description, even though they will later feed the skills register. The future `skills` module will consume projects through the `PortfolioService` interface, not by importing entities/repositories directly.

### D-4: Sub-resource endpoints use plural nouns
`.../portfolio/education`, `.../portfolio/projects`, `.../portfolio/links` follow REST conventions and are easy to extend.

### D-5: Angular section components keep the container focused
The `PortfolioComponent` loads data and coordinates; `EducationSectionComponent`, `ProjectSectionComponent`, and `LinkSectionComponent` own their own forms and lists. This keeps files small and follows the single-responsibility guideline.

### D-6: Flyway owns the portfolio schema
Because Flyway is enabled in the main profile, new tables are added via `V2__add_portfolio_tables.sql`. The test profile continues to disable Flyway and rely on Hibernate `create-drop`, so the entities must still generate a matching schema.

## Risks / Trade-offs

- **[Risk] Employee lookup per portfolio mutation** — every mutating call resolves the employee via `EmployeeService`. Acceptable for POC load; a future split would replace this with an API call.
- **[Risk] No cascading delete from `employees` via JPA** — handled by `ON DELETE CASCADE` in the Flyway migration so the database enforces cleanup.
- **[Risk] Project reuse by skills module** — intentionally deferred; the boundary is the `PortfolioService` interface.
