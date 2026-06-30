## 1. Database Migration

- [x] 1.1 Create `V5__create_skills_tables.sql`: `skill(id, name UNIQUE case-insensitive via LOWER index)`, `employee_skill(id, employee_id FK, skill_id FK, years INT, UNIQUE(employee_id, skill_id))`, `employee_skill_project(employee_skill_id FK, project_id FK, PK(employee_skill_id, project_id))`

## 2. Backend — Skills Module Entities & Repositories

- [x] 2.1 Create `Skill` entity: `@Entity`, `@Table(name="skill")`, fields `id`, `name`; Lombok `@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor`
- [x] 2.2 Create `EmployeeSkill` entity: `@Entity`, `@Table(name="employee_skill")`, fields `id`, `employeeId` (Long FK), `skill` (@ManyToOne), `years` (int), `projects` (@ManyToMany via `employee_skill_project`)
- [x] 2.3 Create `SkillRepository` extending `JpaRepository<Skill, Long>`: add `findByNameIgnoreCase(String name)`; `findAllByOrderByNameAsc()`; custom query for `employeeCount` per skill
- [x] 2.4 Create `EmployeeSkillRepository` extending `JpaRepository<EmployeeSkill, Long>`: `findByEmployeeId(Long id)`; `findByEmployeeIdAndId(Long employeeId, Long id)`; `findBySkillNameIgnoreCase(String name)` for ranked search; count query for `projectCount`

## 3. Backend — Skills Module DTOs

- [x] 3.1 Create `AddEmployeeSkillRequest`: `skillName` (@NotBlank), `years` (@Min(0) @NotNull)
- [x] 3.2 Create `UpdateEmployeeSkillRequest`: `years` (@Min(0) @NotNull)
- [x] 3.3 Create `EmployeeSkillResponse`: `id`, `skillId`, `skillName`, `years`, `projectCount`
- [x] 3.4 Create `SkillSummaryResponse`: `id`, `name`, `employeeCount`
- [x] 3.5 Create `SkillSearchResultResponse`: `employeeId`, `employeeName`, `years`, `projectCount`

## 4. Backend — SkillService Interface & Implementation

- [x] 4.1 Create `SkillService` interface: `addSkillToEmployee`, `updateEmployeeSkill`, `removeEmployeeSkill`, `linkProject`, `unlinkProject`, `getSkillsForEmployee`, `browseRegister`, `searchBySkill`
- [x] 4.2 Create `SkillServiceImpl`: implement `findOrCreate(name)` with case-insensitive dedup; implement `addSkillToEmployee` with duplicate-check (throw 409); implement `updateEmployeeSkill`, `removeEmployeeSkill`
- [x] 4.3 Implement `linkProject` in `SkillServiceImpl`: validate project exists via `PortfolioService.projectExists(projectId)` before linking; idempotent (no error on duplicate link)
- [x] 4.4 Implement `unlinkProject` in `SkillServiceImpl`
- [x] 4.5 Implement `getSkillsForEmployee` in `SkillServiceImpl`: derive `projectCount` per entry via repository count query
- [x] 4.6 Implement `browseRegister` in `SkillServiceImpl`: return all canonical skills with `employeeCount`, ordered by name asc
- [x] 4.7 Implement `searchBySkill` in `SkillServiceImpl`: find all `EmployeeSkill` for the given skill name (case-insensitive), derive `projectCount` per entry, sort by `years` desc then `projectCount` desc

## 5. Backend — PortfolioService Extension

- [x] 5.1 Add `projectExists(Long projectId): boolean` to `PortfolioService` interface and `PortfolioServiceImpl`
- [x] 5.2 Add `List<EmployeeSkillResponse> skills` field to `PortfolioResponse`
- [x] 5.3 Inject `SkillService` into `PortfolioServiceImpl`; populate `skills` field by calling `skillService.getSkillsForEmployee(employeeId)` in the portfolio fetch

## 6. Backend — SkillController

- [x] 6.1 Create `SkillController` with `@RestController @RequestMapping("/api")`, `@RequiredArgsConstructor`
- [x] 6.2 `GET /api/employees/{employeeId}/skills` → `getSkillsForEmployee`; returns 200 list or 404
- [x] 6.3 `POST /api/employees/{employeeId}/skills` → `addSkillToEmployee`; `@Valid` body; returns 201 or 400/404/409
- [x] 6.4 `PUT /api/employees/{employeeId}/skills/{skillId}` → `updateEmployeeSkill`; returns 200 or 400/404
- [x] 6.5 `DELETE /api/employees/{employeeId}/skills/{skillId}` → `removeEmployeeSkill`; returns 204 or 404
- [x] 6.6 `POST /api/employees/{employeeId}/skills/{skillId}/projects/{projectId}` → `linkProject`; returns 200 or 404
- [x] 6.7 `DELETE /api/employees/{employeeId}/skills/{skillId}/projects/{projectId}` → `unlinkProject`; returns 204 or 404
- [x] 6.8 `GET /api/skills` → `browseRegister`; returns 200 list
- [x] 6.9 `GET /api/skills/search?skill={name}` → `searchBySkill`; returns 200 list or 400 if param missing

## 7. Backend — Unit & Integration Tests

- [x] 7.1 `SkillServiceImplTest`: unit tests for `findOrCreate` dedup, duplicate-skill rejection, `searchBySkill` ordering, `projectCount` derivation (Mockito)
- [x] 7.2 `SkillControllerIT`: integration tests (extends `IntegrationTestBase`, Testcontainers Postgres) covering all happy paths and negative paths from the `employee-skills` and `skill-search` specs — including 400, 404, 409 responses
- [x] 7.3 `PortfolioControllerIT`: add test asserting `skills` field appears in portfolio response (extends existing IT class)

## 8. Backend — Seed Data

- [x] 8.1 Enrich `data.sql` with canonical `Skill` rows (Angular, Java, Spring Boot, SQL, TypeScript, Docker)
- [x] 8.2 Add `EmployeeSkill` rows across multiple employees with varied `years` so that the "Who's strong on Angular?" query returns a meaningful ranked list
- [x] 8.3 Add `employee_skill_project` rows linking some skills to existing portfolio projects

## 9. Frontend — SkillsService

- [x] 9.1 Create `SkillsService` (`providedIn: 'root'`): `getEmployeeSkills(id)`, `addSkill(id, req)`, `deleteSkill(employeeId, skillId)`, `browseRegister()`, `searchBySkill(name)` — all returning `Observable` via `HttpClient`

## 10. Frontend — Portfolio Skills Section

- [x] 10.1 Extend `PortfolioComponent` with a skills section: display a list of `EmployeeSkillResponse` cards (skillName, years, projectCount); use `@for` with `OnPush`
- [x] 10.2 Add an inline add-skill reactive form to the skills section: `skillName` (text, required), `years` (number, min 0, required); on submit call `SkillsService.addSkill()` and refresh the list via signal
- [x] 10.3 Add delete button per skill row: call `SkillsService.deleteSkill()` and remove from the signal-backed list
- [x] 10.4 Handle empty skills section: render "No skills recorded yet" placeholder when list is empty

## 11. Frontend — Skills Register Page

- [x] 11.1 Create `SkillsRegisterComponent` at `/skills`: standalone, `OnPush`; displays browseable list of all canonical skills with `employeeCount`
- [x] 11.2 Add a search input (reactive form control): on change (debounced) calls `SkillsService.searchBySkill(name)` and displays ranked `SkillSearchResultResponse` list (employeeName, years, projectCount)
- [x] 11.3 Wire `/skills` route in `app.routes.ts`; add "Skills Register" nav link in the app shell

## 12. Frontend — Tests

- [x] 12.1 Vitest unit tests for `SkillsService` (mock `HttpClient`): verify each method calls the correct endpoint
- [x] 12.2 Vitest component tests for the portfolio skills section: add/delete skill updates the displayed list; empty state renders placeholder
- [x] 12.3 Vitest component tests for `SkillsRegisterComponent`: browse list renders; search filters to ranked results
