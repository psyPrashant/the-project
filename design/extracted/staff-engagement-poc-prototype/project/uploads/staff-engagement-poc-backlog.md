# Staff Engagement POC — Revised Backlog

A small domain exploring how to record staff interactions, turn them into follow-up
tasks, and build a rounded, skills-aware view of a person.

> **How to read this:** Decisions are resolved up front in the Design Decisions log so
> they don't get made by accident during implementation. Every story inherits the
> global Definition of Done — story-level ACs only call out behaviour *specific to that
> story*, including negative paths worth pinning. Stories tagged `(extension)` are
> deliberate stretch scope, not committed.

---

## Design Decisions (resolve before Epic 1)

These are the calls that change the data model or the meaning of a feature. Settle them
here so stories downstream stay consistent.

- **D1 — Skill experience: `years` entered, `projectCount` derived.**
  An `EmployeeSkill` stores `years` as a user-entered value (acceptable for a POC).
  `projectCount` is **not stored** — it is derived from the `EmployeeSkill ↔ Project`
  links. This makes the skills register trustworthy by construction: the count can never
  disagree with the projects backing it. Linking projects (old S2) is therefore *core*,
  not an extension.

- **D2 — Task model.** A Task has:
  - `relatesTo` → the **subject** Employee. "My tasks" means `relatesTo = me`,
    regardless of who created it. This is the centralisation the brief asks for.
  - `createdBy` → provenance (who logged it).
  - `fromInteraction` → optional link back to the interaction that spawned it.
  - `assignee` *(extension)* → who should **action** it. This is intentionally
    **distinct** from `relatesTo`: a task can be *about* someone yet *actioned* by
    someone else. Until the extension lands, the subject owns their tasks.

- **D3 — Every user is an Employee.** Authentication resolves the caller to an Employee
  record. Author/subject on interactions and tasks are both Employee references and may
  be the **same person** — logging an interaction or task against yourself is **allowed**
  (e.g. a self-check-in note).

- **D4 — Permissions (POC stance, kept deliberately light):**
  - Any authenticated user may create/edit/view employees and portfolios — **open by
    design** for the POC.
  - Interaction **edit/delete is restricted to the author** (this guard is real, not POC-
    optional — it's the only provenance integrity rule we keep).
  - A task may be updated/completed by its **subject (`relatesTo`) or its creator**.
  - There are no roles/RBAC beyond the above. Out of scope for the POC.

- **D5 — Skills are canonical.** A `Skill` is a deduplicated reference entity. Recording
  "Angular" for two people references the *same* `Skill`, never two free-text strings —
  otherwise the register can't answer "who's strong on Angular?" reliably.

- **D6 — Explicitly out of scope for the POC:** pagination, role-based access control,
  password reset / account self-service, audit history beyond `createdBy`/timestamps,
  notifications.

---

## Definition of Done (inherited by every story)

A story is not done until:

1. **Unit + integration tests are green.** Backend integration tests run against a real
   Postgres via Testcontainers; no mocking the database for persistence/query logic.
2. **At least one negative / edge path is covered** wherever the story has validation,
   branching, or a permission rule.
3. **An e2e smoke test (Playwright/Cypress) exists for any new user-facing flow.**
4. **CI is green.** A failing test reds the pipeline and blocks merge.
5. **The PR passes the Claude Code review agent** with no unaddressed findings.

Story-level ACs below are *additive* to this — they describe behaviour unique to the
story, not the baseline testing expectation.

---

## Epic 0 — Foundation, Tooling & Test Harness

Set up skills/agents and the test harness **before** writing feature code. Also design
the Skills Register schema here (implemented in Epic 5).

### F1 — Project scaffold
*As a developer I want a running Angular 21 + Spring Boot 3 / Java 21 + Postgres skeleton
so that every later change has somewhere to land.*

- Given a clean checkout, When I run the build, Then frontend and backend both compile and start.
- Given the app is running, When I hit the health endpoint, Then it returns a healthy status.
- Given a push to the repo, When CI runs, Then it builds both apps and runs the test suites.

### F2 — Test harness wired end to end
*As a developer I want the testing stack proven before feature work so that every story
ships with tests from the start.*

- Given the backend, When I run tests, Then JUnit 5 runs with a real Postgres via Testcontainers and an API-level smoke test passes.
- Given the frontend, When I run tests, Then unit/component tests and at least one e2e (Playwright/Cypress) smoke test pass.
- Given CI, When any test fails, Then the pipeline goes red and blocks merge.

### F3 — Project context for Claude Code
*As a developer I want standing project context in the repo so that the agents and I work
from the same source of truth.*

- Given the repo, When I open it in Claude Code, Then `CLAUDE.md` provides standing project context (stack, conventions, domain model, the decisions above).

### F4 — Claude Code review & health agents
*As a developer I want review and health agents configured against this repo so that
quality tooling is available without per-person setup.*

- Given the agent suite, When I run the frontend and backend PR reviewers, Then they operate against this codebase.
- Given the health monitors, When I run them, Then they report against the running app.

### F5 — Test slash-commands
*As a developer I want repeatable test commands mapped to this backlog so that testing is
one keystroke, not a recipe.*

- Given the commands `/test-app`, `/test-epic`, `/test-story`, `/test-static`, `/test-seed`, When I invoke them, Then they map onto these epics/stories and run the intended scope.

### F6 — Authentication & current-user identity
*As an employee I want to log in so that the system knows who I am for provenance and
"my tasks."*

- Given valid credentials, When I log in, Then I receive a session/token **and a resolved current-Employee** (per D3).
- Given invalid credentials, When I log in, Then I'm rejected with no session created.
- Given an unauthenticated request to a protected endpoint, When it's received, Then it's refused.

> **Blocks:** I1, T1, T2, T3 (all provenance/"my tasks" logic depends on the resolved current-Employee).

### F7 — Seed mechanism & baseline demo data
*As a developer I want a one-command seed so that the app is demoable and tests have
realistic fixtures.*

- Given an empty database, When I run `/test-seed` (or the seed task), Then a baseline set of employees, interactions, tasks, and portfolios is created idempotently.
- Given the seed has already run, When I run it again, Then it does not duplicate records.

> **Note:** the *skills* portion of the demo dataset — crafted so "Who's strong on
> Angular?" returns a convincing spread — is delivered in **S6**, once the register schema
> is implemented. F7 establishes the mechanism and the non-skills fixtures.

### F8 (extension) — Skills Register schema design spike
*As a developer I want the register schema (Skill, EmployeeSkill, EmployeeSkill↔Project)
designed and recorded in `CLAUDE.md` so that Epic 5 is implementation, not discovery.*

- Given the domain, When I design the schema, Then `Skill` (canonical), `EmployeeSkill` (with `years`), and the `EmployeeSkill ↔ Project` link (basis for derived `projectCount`) are documented per D1/D5.

---

## Epic 1 — Employee (the spine)

### E1 — Create an employee record
*As a user I want to create an employee so that interactions, tasks, and a portfolio can
hang off them.*

- Given valid details, When I create an employee, Then the record is persisted with a unique id.
- Given a missing required field, When I submit, Then I get a validation error and nothing is saved.

### E2 — View an employee's rounded profile
*As a user I want a single profile view per person so that I get the rounded picture the
spec is chasing.*

- Given an employee with interactions, tasks, and a portfolio, When I open their profile, Then I see their core details plus links into each of those areas.
- Given an employee with no activity yet, When I open their profile, Then I see the record with empty-but-present sections (no errors).

### E3 — List & search employees
*As a user I want to find people quickly so that I can log against the right person.*

- Given several employees, When I search by name, Then matching records are returned.
- Given no matches, When I search, Then I get an empty result, not an error.

### E4 — Edit an employee record
*As a user I want to update employee details so that records stay accurate.*

- Given an existing employee, When I edit and save, Then changes persist and are visible on the profile.
- Given an edit that blanks a required field, When I save, Then I get a validation error and the existing record is unchanged.
- Given any authenticated user (per D4, employee edit is open), When they edit, Then the edit is permitted.

### E5 (extension) — Archive an employee
*As a user I want to deactivate a record so that former staff drop out of active views
without losing history.*

- Given an active employee, When I archive them, Then they're excluded from default lists but their history (interactions, tasks, portfolio) remains intact and viewable.

---

## Epic 2 — Interactions

### I1 — Log an interaction against an employee
*As an employee I want to record a note after engaging with someone so that the
interaction isn't lost in personal notes.*

- Given a subject employee, When I log an interaction (note, type, date), Then it's saved with `author = current user` and `subject = that employee`.
- Given the subject is myself (per D3), When I log it, Then it's saved as a valid self-interaction.
- Given a missing note body, When I submit, Then I get a validation error.

### I2 — View an employee's interaction timeline
*As a user I want to see all interactions for a person so that I understand their history
regardless of who logged them.*

- Given multiple interactions by different authors, When I open the timeline, Then I see each with author, date, type, and note, newest first.
- Given a person with no interactions, When I open the timeline, Then I see an empty timeline, not an error.

### I3 — Edit or delete my own interaction
*As an author I want to fix or remove an interaction I logged so that I can correct
mistakes.*

- Given an interaction I authored, When I edit or delete it, Then the change persists.
- Given an interaction authored by someone else, When I try to edit or delete it, Then I'm refused (per D4).

### I4 (extension) — Filter interactions
*As a user I want to filter by type, author, or date so that I can focus a long
timeline.*

- Given a timeline, When I filter by type/author/date, Then only matching interactions show.
- Given a filter that matches nothing, When I apply it, Then I get an empty result, not an error.

---

## Epic 3 — Tasks

Centralised at the person level (D2): I see tasks where `relatesTo = me`, regardless of
creator.

### T1 — Spawn a follow-up task from an interaction
*As an employee I want to turn an interaction into a task so that follow-ups don't get
dropped.*

- Given an interaction, When I create a task from it, Then the task carries `fromInteraction`, `relatesTo = the interaction's subject`, and `createdBy = current user`.

### T2 — Create a standalone task against an employee
*As an employee I want to create a task not tied to an interaction so that I can capture
any follow-up.*

- Given a subject employee, When I create a task, Then it's saved with `relatesTo` and `createdBy` set, and `fromInteraction` empty.
- Given a missing required field (e.g. title), When I submit, Then I get a validation error and nothing is saved.

### T3 — View "my tasks"
*As an employee I want to see tasks relating to me on login so that I don't have to hunt
across creators.*

- Given tasks where `relatesTo = me`, created by various people, When I open my tasks, Then I see all of them regardless of creator.
- Given tasks relating to other people, When I open my tasks, Then those are excluded.

### T4 — Update / complete a task
*As an employee I want to change a task's status so that progress is tracked.*

- Given an open task where I am the subject or creator (per D4), When I mark it done, Then its status persists and it leaves my open list.
- Given a task where I am neither subject nor creator, When I try to change it, Then I'm refused.

### T5 (extension) — Due dates & assignment
*As an employee I want due dates and explicit assignment so that ownership and timing are
clear.*

- Given a task, When I set a due date and `assignee` (distinct from `relatesTo`, per D2), Then both persist.
- Given an assignee, When that person views their work, Then the task surfaces to them as assigned (separately from "relates to me").

---

## Epic 4 — Portfolio

Per employee: education, projects, public links. Built to feed the Skills Register. The
**skills section of the portfolio is delivered in Epic 5 (S7)** to avoid a forward
dependency — Epic 4 owns the three portfolio-native sections.

### P1 — Manage education history
*As a user I want to record an employee's education so that their background is captured.*

- Given an employee, When I add an education entry, Then it appears in their portfolio.
- Given an entry, When I edit or remove it, Then the change persists.
- Given an entry missing a required field, When I save, Then I get a validation error.

### P2 — Manage projects worked on
*As a user I want to record projects so that skills can later be tied to real work.*

- Given an employee, When I add a project, Then it's persisted and **available to link skills against** (basis for S2's derived count).
- Given a project, When I edit or remove it, Then the change persists.

### P3 — Manage public links
*As a user I want to add showcase links (GitHub etc.) so that a person's public work is
discoverable.*

- Given a portfolio, When I add a link with a label and URL, Then it appears and the URL is validated.
- Given an invalid URL, When I submit, Then I get a validation error and nothing is saved.

### P4 — View full portfolio (education, projects, links)
*As a user I want the portfolio in one place so that I see a person's background
together.*

- Given an employee with portfolio data, When I open the portfolio, Then education, projects, and links all render.
- Given an employee with no portfolio data, When I open it, Then sections render empty-but-present.

> **Note:** the skills section is added to this view in **S7**.

---

## Epic 5 — Skills Register (the centrepiece)

Schema designed in Epic 0 (F8); implemented here. The aggregate query is the
differentiator, and its `projectCount` is **derived** (D1).

### S1 — Record a skill for an employee with years
*As a user I want to register a skill for an employee with years of experience so that
experience is quantified, not just listed.*

- Given an employee and a canonical `Skill`, When I record it with `years`, Then an `EmployeeSkill` is persisted.
- Given a skill name not yet in the register, When I add it, Then a canonical `Skill` is created/reused so the same skill isn't duplicated as free text (D5).
- Given the same skill recorded twice for one employee, When I submit the duplicate, Then it's rejected or merged (not double-counted).

### S2 — Link a skill to the projects that used it (derives the count)
*As a user I want to link a skill to real projects so that the project count is justified,
not guessed.*

- Given an `EmployeeSkill`, When I link it to projects from the portfolio, Then those links persist.
- Given those links, When `projectCount` is read, Then it equals the number of linked projects — it is **derived, never stored** (D1).
- Given a project is unlinked, When the count is read again, Then it decreases accordingly.

### S3 — "Who's strong on \<skill\>?"
*As a user I want to query the register by skill so that I get names, years, and project
count.*

- Given several employees with the same skill, When I query that skill, Then I get a ranked list of names with `years` and derived `projectCount`.
- Given the ranking, Then the default order is **`years` desc, then `projectCount` desc** (most experienced first; ties broken by breadth of projects).
- Given a skill nobody has, When I query it, Then I get an empty result, not an error.

### S4 — Browse & sort the register
*As a user I want to explore the whole register so that I can find depth across skills.*

- Given the register, When I sort by `years` or `projectCount` for a skill, Then results order correctly.
- Given an empty register, When I browse, Then I see an empty state, not an error.

### S5 — Mutation-test the aggregate query
*As a developer I want mutation coverage on the register's aggregate/query logic so that
the testing focus is demonstrated, not just asserted, on the highest-risk code.*

- Given the skills aggregate query and its tests, When I run PITest, Then mutation coverage meets an agreed threshold and surviving mutants are reviewed (each either killed with a new test or justified as equivalent).

### S6 — Skills demo dataset
*As a developer I want the seed enriched with a realistic skills spread so that
"Who's strong on Angular?" is convincing in a demo.*

- Given the seed runs, When it completes, Then multiple employees share overlapping skills (incl. Angular and Java) with varied `years` and linked projects, so S3 returns a meaningful ranked list.

### S7 — Surface skills on the portfolio
*As a user I want the portfolio's skills section populated so that the portfolio is whole.*

- Given an employee with `EmployeeSkill` records, When I open their portfolio (P4), Then the skills section renders skills with `years` and derived `projectCount`.
- Given an employee with no skills, When I open the portfolio, Then the skills section renders empty-but-present.

### S8 (extension) — Proficiency, endorsements, last-used
*As a user I want richer signal per skill so that the register reflects more than raw
years.*

- Given an `EmployeeSkill`, When I add proficiency level, endorsement, or last-used date, Then it persists and is available to queries.

---

## Dependency summary

- **F6 (auth)** blocks I1, T1, T2, T3 — provenance and "my tasks" need the resolved current-Employee.
- **F8 (schema design)** blocks all of Epic 5.
- **P2 (projects)** blocks S2 — there must be projects to link a skill against.
- **S1 → S2 → S3** is the critical path to the centrepiece; **S6** makes it demoable; **S5** proves its tests; **S7** closes the loop back into the portfolio.
