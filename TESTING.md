# Testing Strategy — The Staff Project

How this platform is tested, why each layer exists, and how to run every layer locally.
This document is the reference for presenting the project's quality story.

---

## 1. Philosophy

The backend is a **modular monolith** (`employee`, `interaction`, `task`, `portfolio`, `skills`) with a
strict `Controller → Service → ServiceImpl → Repository` layering. Testing follows the same discipline:
**each layer is verified by the cheapest test that can prove it**, and higher layers are only re-proven
where integration or user behaviour actually matters.

Four principles drive the suite:

1. **Fast feedback first.** Pure logic is covered by mocked unit tests that need no database or Spring context.
2. **Real infrastructure where it counts.** Persistence, transactions, and security are proven against a
   **real PostgreSQL** via Testcontainers — never an in-memory substitute.
3. **Acceptance criteria are executable.** Business rules are written as Gherkin and run as Cucumber tests,
   so the specification and the test are the same artifact.
4. **Test the tests.** Mutation testing (PIT / Stryker) measures whether the suite would actually catch a bug,
   not just whether lines were executed.

---

## 2. The test pyramid

| Layer | Stack | Tooling | Count | What it guarantees |
|-------|-------|---------|-------|--------------------|
| **Unit** | Backend | JUnit 5 + Mockito + AssertJ | 141 tests / 15 classes | Service & controller logic, validation, branching — in isolation, mocked deps |
| **Unit / Component** | Frontend | Vitest (jsdom) | 183 tests / 29 specs | Services, signals, components, guards, interceptors |
| **Integration** | Backend | `@SpringBootTest` + Testcontainers Postgres | 8 `*IT` classes | Real HTTP → JPA → Postgres round-trips, security, unique constraints |
| **BDD / Acceptance** | Backend | Cucumber 7 (JUnit Platform) | 70 scenarios / 5 features | Business rules as executable Gherkin against a real DB |
| **E2E** | Full stack | Playwright (Chromium) | 34 tests / 7 specs | User-facing flows through the real UI + live backend |
| **Mutation** | Backend / Frontend | PIT 1.17.4 / Stryker 9.6.1 | Whole backend (PIT, 69%, gated ≥65%) / `skills` (Stryker) | Effectiveness of the tests themselves |

Wide, fast base (unit) → focused, realistic middle (integration + BDD) → thin, high-value top (e2e).
Mutation testing runs orthogonally as a quality gate on the suite.

---

## 3. Backend testing (Spring Boot 3.5 / Java 17)

Location: `staff-engagement-backend/`

### Unit tests — JUnit 5 + Mockito
- **Pattern:** `src/test/java/**/*Test.java`, run by **Surefire** during `mvn test`.
- **Style:** `@ExtendWith(MockitoExtension.class)`, `@Mock` collaborators, `@InjectMocks` target, AssertJ assertions.
- **Coverage:** every module's `ServiceImpl` and controller — `auth` (5 classes), `skills`, `portfolio`,
  `employee`, `interaction`, `task`. Includes negative/edge paths (validation, permissions, not-found).

### Integration tests — Testcontainers
- **Pattern:** `src/test/java/**/*IT.java`, run by **Failsafe** during `mvn verify`.
- **Base class:** `IntegrationTestBase` — `@SpringBootTest(webEnvironment = MOCK)` + `@AutoConfigureMockMvc`,
  with a **shared static `PostgreSQLContainer("postgres:16-alpine")`** wired via `@ServiceConnection`.
- **Classes:** `AuthFlowIT`, `EmployeeCrudIT`, `InteractionCrudIT`, `PortfolioCrudIT`, `SkillControllerIT`,
  `TaskControllerIT`, `BackendApiSmokeIT`, `StaffEngagementBackendApplicationIT`.
- Hibernate `create-drop` per run; `data.sql` seeds login users. Uses **MockMvc** (not a live socket) — see
  the *Known environment note* below for why this matters on Windows.

### BDD / Acceptance — Cucumber 7
- **Runner:** `bdd/CucumberIT.java` (`@Suite` + `@IncludeEngines("cucumber")`), executed by Failsafe.
- **Spring wiring:** `bdd/CucumberSpringConfig.java` (`@CucumberContextConfiguration` extending `IntegrationTestBase`).
- **Features:** `src/test/resources/features/{employee,interaction,portfolio,skills,task}.feature` — **70 scenarios**.
- **Steps:** `bdd/steps/` — `CommonSteps` (generic HTTP verbs + assertions + auth + `${placeholder}` substitution),
  per-domain fixture steps, and `HookSteps` (`@Before` cleans non-core data for isolation).
- **Reports:** `target/cucumber-reports/report.html` and `report.json`.

### Mutation testing — PIT (pitest)
- **Plugin:** `pitest-maven` 1.17.4 + `pitest-junit5-plugin` 1.2.1.
- **Scope:** `targetClasses = com.psybergate.staff_engagement.*`, `targetTests = *Test` (the **unit** suite).
  Spring config/bootstrap and DTO records are `excludedClasses` — their behaviour is only meaningfully
  exercised by `*IT` integration tests, not unit mutation.
- **Gate:** `mutationThreshold = 65` — the build fails if unit-test mutation coverage regresses below it.
  Current score **69%** (209/304 killed), **89% test strength**, `DEFAULTS` mutators, HTML + XML output.
- **Run:** `./mvnw pitest:mutationCoverage`; report at `target/pit-reports/index.html`.
- **Report:** `target/pit-reports/index.html`.

---

## 4. Frontend testing (Angular 21)

Location: `staff-engagement-frontend/`

### Unit / component — Vitest
- **Config:** `vitest.config.ts` (jsdom, `@analogjs/vite-plugin-angular`, setup `src/test-setup.ts` with strict
  unknown-element/property errors).
- **Pattern:** `src/**/*.spec.ts` — **29 specs / 183 tests** across `auth`, `employees`, `interactions`,
  `portfolios`, `tasks`, `skills`, `dashboard`, `shell`, `shared`.

### E2E — Playwright
- **Config:** `playwright.config.ts` — testDir `e2e/`, Chromium, baseURL `http://localhost:4200`,
  `webServer` auto-starts `ng serve` (reuses a running server locally, fresh in CI), retries 1 in CI.
- **Specs (34 tests):** `app` (auth + shell), `people`, `dashboard`, `skills`, `task`, `portfolio`, `interaction`.
- **Requires** a live backend on `:8080` and the seeded login `admin@psybergate.com` / `password123`.

### Mutation testing — Stryker
- **Config:** `stryker.config.mjs` — mutates `skills.service.ts` + `skills-register.ts`, command runner over the
  skills Vitest specs, HTML/JSON/clear-text reporters. Report under `reports/mutation/`.
- Run with `npx stryker run` (not part of the standard local pass).

---

## 5. CI pipeline

`.github/workflows/ci.yml` — runs on push/PR to `main`, three **parallel** jobs; all must pass to merge:

| Job | Steps |
|-----|-------|
| **Frontend (build & test)** | `npm ci` → `npm run build --configuration production` → `npm run test:ci` |
| **Frontend (e2e smoke)** | `npm ci` → install Chromium → build backend jar → start jar (`nohup java -jar`) → wait for `/actuator/health` → `npm run e2e` |
| **Backend (build & test)** | JDK 17 (Temurin) → `./mvnw -B -ntp verify` (unit + integration + Cucumber via Testcontainers) |

Mutation testing (PIT / Stryker) is available on demand and not currently a blocking CI gate.

---

## 6. Running the whole suite locally

**Prerequisites:** Docker Desktop running; Node 24 / npm 11; JDK 17.

```bash
# 0. Database
docker compose up -d db

# 1. Backend: unit + integration + Cucumber (one command)
cd staff-engagement-backend
./mvnw -B -ntp verify

# 2. Backend mutation (skills module)
./mvnw -B -ntp pitest:mutationCoverage        # report: target/pit-reports/index.html

# 3. Frontend unit
cd ../staff-engagement-frontend
npm ci
npm run test:ci

# 4. Frontend mutation (skills module)
npx stryker run                               # report: reports/mutation/

# 5. E2E — needs a live backend on :8080
#    Start the backend (see note below on Windows), then:
npx playwright install chromium               # first run only
npm run e2e                                    # Playwright auto-starts ng serve on :4200
```

### Known environment note (Windows) — running the live backend for E2E

The backend **integration/BDD tests run fine** on Windows because they use `WebEnvironment.MOCK` (MockMvc) and
never open a real server socket. Starting the **real** embedded Tomcat (`./mvnw spring-boot:run`) can fail on some
Windows setups with:

```
java.io.IOException: Unable to establish loopback connection
Caused by: java.net.SocketException: Invalid argument: connect   (sun.nio.ch.UnixDomainSockets.connect0)
```

This is a JDK NIO selector self-pipe issue (AF_UNIX loopback rejected by the environment), **not** a project bug.
Two reliable ways to get a live backend for Playwright:

- **CI does it with a jar:** `./mvnw -DskipTests package` then `java -jar target/*.jar` (works on Linux CI).
- **Locally, run the jar in a Linux container** (bypasses the Windows AF_UNIX issue):
  ```bash
  ./mvnw -DskipTests package
  docker run -d --name se-backend --network <db-net> -p 8080:8080 \
    -e SPRING_DATASOURCE_URL="jdbc:postgresql://<db-host>:5432/staff_engagement" \
    -e SPRING_DATASOURCE_USERNAME=postgres -e SPRING_DATASOURCE_PASSWORD=postgres \
    -v "$PWD/target:/app:ro" eclipse-temurin:17-jre \
    java -jar /app/staff-engagement-backend-0.0.1-SNAPSHOT.jar
  ```

> Also on Windows: if a **native PostgreSQL** service occupies port `5432`, it can shadow the Docker `db`
> container for `localhost` connections (different password → `password authentication failed for user "postgres"`).
> Publish the Docker DB on a free port (e.g. `5433:5432`) and point `SPRING_DATASOURCE_URL` at it.

---

## 7. Definition of Done (per `CLAUDE.md`)

1. Unit + integration tests green; `*IT` tests run against real PostgreSQL via Testcontainers in CI.
2. At least one negative/edge path wherever there is validation, branching, or a permission rule.
3. An e2e smoke test (Playwright) for any new user-facing flow.
4. CI green — a failing test reds the pipeline and blocks merge.
5. PR passes the Claude Code review agent with no unaddressed findings.

---

## 8. Latest verification run — 2026-07-02

| Layer | Command | Result |
|-------|---------|--------|
| Backend unit (Surefire) | `./mvnw verify` | ✅ **141** passed, 0 failures |
| Backend integration + BDD (Failsafe) | `./mvnw verify` | ✅ **176** passed (incl. Cucumber **70** scenarios), BUILD SUCCESS |
| Backend mutation (PIT, whole backend) | `./mvnw pitest:mutationCoverage` | ✅ **69%** mutation score (209/304 killed), **89%** test strength — passes ≥65% gate |
| Frontend unit (Vitest) | `npm run test:ci` | ✅ **183** passed / 29 files |
| E2E (Playwright, Chromium) | `npm run e2e` | ✅ **34** passed |
| Frontend mutation (Stryker) | `npx stryker run` | ⏭️ not run this pass |

**Everything green.** E2E was executed with the backend jar running in a Linux container (per the Windows note above).
