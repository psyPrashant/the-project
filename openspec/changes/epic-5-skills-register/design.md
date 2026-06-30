## Context

The platform has `employee`, `interaction`, `task`, and `portfolio` modules. None expose skill data. The `portfolio` spec explicitly deferred the skills section to Epic 5. Design decision D1 states `projectCount` is derived from `EmployeeSkill ↔ Project` links and never stored. Design decision D5 states skills are canonical deduplicated reference entities — never free text.

The existing `Project` entity lives in the `portfolio` module. The new `skills` module needs to link `EmployeeSkill` records to those projects to derive `projectCount`, which creates a controlled cross-module dependency.

## Goals / Non-Goals

**Goals:**
- New `skills` module: `Skill` (canonical) + `EmployeeSkill` (employee-to-skill with `years`) entities, full repository/service/controller stack.
- `projectCount` always computed via aggregate query over the `employee_skill_project` join table — never persisted.
- Ranked search endpoint: employees for a given skill, ordered by `years` desc then `projectCount` desc.
- Browse endpoint: all canonical skills with their employee count.
- Portfolio view extended to include employee skills (backend `PortfolioResponse` + Angular UI).
- Seed data enriched with realistic overlapping skills across employees.

**Non-Goals:**
- Proficiency levels, endorsements, last-used date (S8 — deferred to a separate change).
- Pagination (D6 — out of scope for POC).
- RBAC beyond D4 (any authenticated user may manage skills for any employee).
- Fuzzy / partial-name skill matching (exact case-insensitive match only).

## Decisions

### D-SK1 — New `skills` module, self-contained

A new `skills` package under `com.psybergate.staff_engagement.skills` follows the established module layout: `Skill`, `EmployeeSkill` entities → `SkillRepository`, `EmployeeSkillRepository` → `SkillService` interface + `SkillServiceImpl` → `SkillController`.

**Alternative considered:** Embed skills in the `employee` module. Rejected — skills is a distinct domain (canonical entities, its own querying concerns) and deserves its own boundary.

### D-SK2 — Canonical `Skill` deduplication by name (case-insensitive)

`Skill` has a `name` column with a unique constraint (case-insensitive via `LOWER(name)` unique index). `SkillServiceImpl.findOrCreate(name)` trims whitespace and lowercases before lookup; if found it returns the existing `Skill`, otherwise creates a new one.

**Alternative considered:** Store raw name and deduplicate at query time. Rejected — a canonical entity is cleaner and consistent with D5.

### D-SK3 — `projectCount` derived via JPQL aggregate, not stored

`EmployeeSkillRepository` exposes a query:

```sql
SELECT COUNT(esp.project_id)
FROM employee_skill_project esp
WHERE esp.employee_skill_id = :employeeSkillId
```

`SkillServiceImpl` calls this when building `EmployeeSkillResponse`. No trigger, no column.

**Alternative considered:** Store `projectCount` and update on project link/unlink. Rejected — contradicts D1 and adds an update anomaly surface.

### D-SK4 — `employee_skill_project` is a simple join table owned by `skills` module

`EmployeeSkill` has a `@ManyToMany` relationship to `Project` (from the `portfolio` module) via a join table `employee_skill_project(employee_skill_id, project_id)`. The `skills` module references `Project` by its `Long` id FK only — it never calls `PortfolioRepository` directly; it calls `PortfolioService.projectExists(Long id)` to validate before linking.

**Alternative considered:** Bidirectional mapping from `Project` back to `EmployeeSkill`. Rejected — that bleeds `skills` concerns into `portfolio`. The join table is owned one-way.

### D-SK5 — `PortfolioService` calls `SkillService` for the skills section

`PortfolioResponse` grows a `List<EmployeeSkillResponse> skills` field. `PortfolioServiceImpl` calls `skillService.getSkillsForEmployee(employeeId)` to populate it. This is the only cross-module call added by this epic, and it goes through the service interface as required by architecture rules.

**Alternative considered:** Add a separate `GET /api/employees/{id}/skills` response and let the frontend make two requests. Rejected — the portfolio page shows skills alongside education/projects; a single response is simpler for the UI and consistent with how the portfolio already aggregates sub-resources.

### D-SK6 — Ranked search uses a JPQL query with ORDER BY

`SkillRepository` exposes:

```sql
SELECT es FROM EmployeeSkill es
WHERE LOWER(es.skill.name) = LOWER(:skillName)
ORDER BY es.years DESC
```

`projectCount` is computed per result in `SkillServiceImpl` (second query per row) and used to build a sorted `EmployeeSkillSearchResponse`. For the POC data size this N+1 is acceptable.

**Alternative considered:** Single query with a subquery for count. More complex JPQL for minimal POC gain; easy to optimise later with a native query.

## Risks / Trade-offs

- **[Risk] N+1 on ranked search** — `projectCount` requires a second query per `EmployeeSkill`. Acceptable at POC scale; mitigate later with a single native query or a `@Formula`. → Mitigation: document as a known limitation in code comment.
- **[Risk] Skill name deduplication collisions** — "Java" and "java" map to the same canonical skill. Users may be surprised. → Mitigation: API returns the canonical cased name so the UI can show the normalised form.
- **[Risk] Portfolio `SkillService` dependency** — `PortfolioServiceImpl` now depends on `SkillService`. If `skills` module is extracted later, this needs an anti-corruption layer. → Mitigation: acceptable for POC monolith; note in architecture doc.

## Migration Plan

1. Add Flyway migration `V5__create_skills_tables.sql` — creates `skill`, `employee_skill`, `employee_skill_project` tables.
2. Deploy backend — Flyway runs automatically on startup.
3. Enrich `data.sql` seed with skills data (dev/test only; applied on clean schema).
4. No rollback concern for POC — no existing skills data to preserve.

## Open Questions

- Should skill names be stored as-entered (display) but matched case-insensitively, or always normalised to lowercase? → Decision: store as-entered (preserve user casing), match case-insensitively via `LOWER()` index.
