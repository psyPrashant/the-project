## Why

The platform can log interactions and track portfolios but has no way to answer the most important resourcing question: *"Who in this organisation is strong on Angular?"* Epic 5 adds the Skills Register — the centrepiece feature that makes staff experience searchable and comparable across the whole employee base.

## What Changes

- New canonical `Skill` entity: deduplicated reference record for a named technology/discipline (never stored as free text — D5).
- New `EmployeeSkill` join entity linking an `Employee` to a `Skill` with a user-entered `years` field and a derived (never stored) `projectCount` drawn from existing `EmployeeSkill ↔ Project` links (D1).
- New `skills` backend module: `Skill` + `EmployeeSkill` repositories, service interface + impl, REST controller.
- New `GET /api/skills/search?skill=<name>` endpoint returning a ranked list of employees (ranked by `years` desc, then `projectCount` desc).
- New `GET /api/skills` endpoint to browse and sort the full register.
- Employee skill management endpoints: add, update, remove a skill for an employee; link/unlink projects to a skill entry.
- Enriched seed data (`data.sql`) with overlapping skills across employees (Angular, Java, etc.) so the ranked search is meaningful in a demo.
- Portfolio view extended to surface an employee's skills (S7 — the `portfolio` spec explicitly deferred this to Epic 5).
- S8 (proficiency levels, endorsements, last-used) is an extension story and is **out of scope** for this change; it will be a separate OpenSpec change when prioritised.

## Capabilities

### New Capabilities

- `employee-skills`: Record, update, and remove skills for an employee. Covers canonical `Skill` creation/reuse, `EmployeeSkill` persistence with `years`, project-linking to derive `projectCount`, and duplicate-skill prevention per employee (TSP-33, TSP-34).
- `skill-search`: Query the skills register. Covers ranked search by skill name ("Who's strong on X?" — returns employees ordered by `years` desc then `projectCount` desc), browse/sort the full register, and empty-result handling (TSP-35, TSP-36).

### Modified Capabilities

- `portfolio`: Add a skills section to the employee portfolio view. The existing `portfolio` spec deferred this explicitly to Epic 5 (TSP-39).

## Impact

**Backend**
- New module directory: `src/main/java/com/psybergate/staff_engagement/skills/`
- New Flyway migration: `V5__create_skills_tables.sql` (creates `skill` and `employee_skill` tables; `employee_skill_project` join table for the project-count link).
- `portfolio` module: `PortfolioService` gains a cross-module dependency on `SkillService` to include skills in `PortfolioResponse`.
- `data.sql` seed enriched with realistic skills entries.

**Frontend**
- New `SkillsService` (Angular, `providedIn: 'root'`).
- Employee profile/portfolio component gains a skills section (add/remove skills, link projects, display years + derived count).
- Skills register page: browse all skills with search-by-name ranked results.

**API (new endpoints)**
- `GET /api/skills` — browse full register
- `GET /api/skills/search?skill={name}` — ranked employee list for a skill
- `POST /api/employees/{id}/skills` — add skill to employee
- `PUT /api/employees/{id}/skills/{skillId}` — update years / linked projects
- `DELETE /api/employees/{id}/skills/{skillId}` — remove skill from employee
- `POST /api/employees/{id}/skills/{skillId}/projects/{projectId}` — link project
- `DELETE /api/employees/{id}/skills/{skillId}/projects/{projectId}` — unlink project

**Dependencies**
- `portfolio` module gets a compile-time dependency on `skills` module service interface (cross-module call via interface per architecture rules).
- No new third-party libraries required.
