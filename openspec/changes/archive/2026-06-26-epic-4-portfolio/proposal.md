## Why

The platform needs a per-employee portfolio so that education history, real-world projects, and public showcase links can be maintained in one place. Projects in the portfolio are also the foundation for Epic 5's skill-project links and derived project counts (D1). Currently no portfolio functionality exists.

## What Changes

- Add a new backend `portfolio` module with three entities: `Education`, `Project`, and `ShowcaseLink`.
- Add Flyway migration `V2__add_portfolio_tables.sql` for the three portfolio tables with foreign keys to `employees`.
- Add REST endpoints under `/api/employees/{employeeId}/portfolio` for full-portfolio reads and CRUD on each sub-resource.
- Add Bean Validation DTOs for create/update requests and response DTOs.
- Add `PortfolioService` interface + implementation that validates the owning employee via `EmployeeService`.
- Add an Angular `portfolios/` feature: models, service, `PortfolioComponent` container, and section components for education/projects/links.
- Wire `/employees/:id/portfolio` route and link to it from the employee profile.
- Add backend unit/integration tests and frontend Vitest tests.
- Add Cucumber BDD feature for the portfolio acceptance criteria and run mutation testing.

## Capabilities

### New Capabilities
- `portfolio`: Full CRUD for employee education history, projects, and showcase links, plus an aggregated portfolio view. Covers Jira stories TSP-29 through TSP-32.

## Impact

- **Backend**: new `portfolio` module, `V2__add_portfolio_tables.sql`, new DTOs/service/controller, new integration/unit tests.
- **Frontend**: new `portfolios/` feature, route update, employee profile link update, new component/service tests.
- **API surface**: new REST endpoints under `/api/employees/{employeeId}/portfolio`.
- **Database**: three new tables `portfolio_education`, `portfolio_projects`, `portfolio_links`.
- **No breaking changes** to existing employee/auth endpoints.
