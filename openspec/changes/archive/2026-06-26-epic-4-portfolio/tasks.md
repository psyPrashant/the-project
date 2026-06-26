## 1. Openspec change scaffolding

- [x] 1.1 Create change directory `openspec/changes/2026-06-26-epic-4-portfolio/`
- [x] 1.2 Write `.openspec.yaml`, `proposal.md`, `design.md`, `tasks.md`
- [x] 1.3 Write `specs/portfolio/spec.md`
- [x] 1.4 Write `specs/portfolio/portfolio.feature`

## 2. Database schema

- [x] 2.1 Create Flyway migration `V2__add_portfolio_tables.sql` with `portfolio_education`, `portfolio_projects`, and `portfolio_links`
- [x] 2.2 Ensure foreign keys use `ON DELETE CASCADE`

## 3. Backend entities and repositories

- [x] 3.1 Create `Education`, `Project`, `ShowcaseLink` entities in `portfolio` module
- [x] 3.2 Create `EducationRepository`, `ProjectRepository`, `ShowcaseLinkRepository`

## 4. Backend DTOs

- [x] 4.1 Create create/update request DTOs with Bean Validation
- [x] 4.2 Create response DTOs and aggregated `PortfolioResponse`

## 5. Backend service

- [x] 5.1 Create `PortfolioService` interface
- [x] 5.2 Implement `PortfolioServiceImpl` with employee validation and CRUD operations

## 6. Backend controller

- [x] 6.1 Create `PortfolioController` with full-portfolio read and sub-resource CRUD endpoints
- [x] 6.2 Use `@Valid` on request bodies and map exceptions via existing handlers

## 7. Backend unit tests

- [x] 7.1 Create `PortfolioServiceImplTest` covering happy paths and not-found cases

## 8. Backend integration tests

- [x] 8.1 Create `PortfolioCrudIT` extending `IntegrationTestBase`
- [x] 8.2 Cover education/project/link CRUD, validation errors, and full portfolio view

## 9. Frontend models and service

- [x] 9.1 Create `portfolios/portfolio.models.ts`
- [x] 9.2 Create `portfolios/portfolio.service.ts`
- [x] 9.3 Write `portfolio.service.spec.ts`

## 10. Frontend components

- [x] 10.1 Create `PortfolioComponent` container
- [x] 10.2 Create `EducationSectionComponent`, `ProjectSectionComponent`, `LinkSectionComponent`
- [x] 10.3 Add `/employees/:id/portfolio` route
- [x] 10.4 Link to portfolio from employee profile

## 11. Frontend component tests

- [x] 11.1 Write `portfolio.spec.ts`
- [x] 11.2 Write section component specs

## 12. BDD and mutation verification

- [x] 12.1 Run `cucumber-test` agent to generate/run Cucumber scenarios
- [x] 12.2 Run `mutation-test` agent and address survivors

## 13. Final verification

- [x] 13.1 Run `./mvnw verify` and fix failures
- [x] 13.2 Run `npm test` and fix failures
- [x] 13.3 Update `tasks.md` checkboxes
- [x] 13.4 Commit with conventional message referencing TSP-5
