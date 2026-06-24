## Why

Every provenance and "my tasks" feature in the Staff Engagement POC depends on the system knowing *who the caller is, resolved to an Employee* (D3 — every user is an Employee). Today the backend is an empty Spring Boot skeleton with no security, no Employee entity, and no notion of a current user; Jira F6/TSP-12 (which blocks I1, T1, T2, T3) requires a login flow that issues a credential and resolves the caller to an Employee, plus refusal of unauthenticated requests to protected endpoints. This change establishes that identity foundation end-to-end so the remaining domain modules can attribute interactions, tasks, and portfolios to a real current Employee.

## What Changes

- Add Spring Security with **stateless JWT** auth to the backend (`spring-boot-starter-security`, `jjwt` 0.12.x, `spring-boot-starter-validation`).
- Introduce a minimal **`employee` module** (identity slice): `Employee` entity (`id`, `firstName`, `lastName`, `email`, `passwordHash`), `EmployeeRepository`, `EmployeeService`/`EmployeeServiceImpl`, `EmployeeResponse` DTO. No Employee controller/create endpoint in this change (D6 — no self-service).
- Introduce an **`auth` module**: `SecurityConfig` (BCrypt, stateless, CORS for `localhost:4200`, permit `/api/auth/login` + `/actuator/health`), `JwtService`, `JwtAuthenticationFilter` (resolves Employee via `EmployeeService`), `EmployeeUserDetailsService`/`EmployeePrincipal`, `@CurrentEmployee` annotation + `HandlerMethodArgumentResolver`, `AuthController` (`POST /api/auth/login`, `GET /api/auth/me`), `GlobalExceptionHandler` + `ErrorResponse`.
- Seed 3 Employees with pre-computed **BCrypt** hashes via `data.sql` (`ON CONFLICT (email) DO NOTHING`); enable `spring.sql.init.mode=always` + `spring.jpa.defer-datasource-initialization=true` in **both** main and test `application.properties`.
- Add an Angular 21 **login UI**: `environments` (`apiUrl`), `provideHttpClient(withInterceptors([authInterceptor]))`, `AuthService` (signals + `localStorage` token), `authInterceptor` (Bearer injection), `authGuard` (`CanActivateFn` redirect to `/login`), `LoginComponent` (reactive form, OnPush, Tailwind, WCAG AA), `HomeComponent`, routes.
- Tests across all layers: backend unit (`JwtServiceTest`, `AuthControllerTest`, `CurrentEmployeeArgumentResolverTest`, `SecurityConfigTest`, `EmployeeUserDetailsServiceTest`), backend integration `AuthFlowIT` against Testcontainers Postgres, frontend Vitest specs, Playwright e2e `auth.spec`.

## Capabilities

### New Capabilities
- `authentication`: JWT issuance and validation, login endpoint, current-Employee resolution, protected-endpoint refusal, and the security configuration/error contract.
- `employee`: the Employee identity record — entity fields, repository, service interface, and seeding (identity slice only; to be extended by later epics for skills/portfolio/interactions).

### Modified Capabilities
<!-- None — openspec/specs/ is empty; no existing capabilities are modified. -->

## Impact

- **Backend code**: new packages `com.psybergate.staff_engagement.employee` and `com.psybergate.staff_engagement.auth`; first real domain code in the skeleton.
- **Dependencies**: add `spring-boot-starter-security`, `spring-boot-starter-validation`, `jjwt-api`/`jjwt-impl`/`jjwt-jackson` (0.12.6), `spring-security-test` (test) to `pom.xml`.
- **Config**: `application.properties` (main + test) gain JWT secret/expiry, SQL-init, actuator-exposure keys.
- **Database**: `data.sql` seeds 3 Employees with BCrypt hashes; schema created by Hibernate (`ddl-auto=update` main, `create-drop` test).
- **Frontend**: first feature code — `provideHttpClient`, auth service/interceptor/guard, login + home components, routes, environments.
- **APIs**: new public `POST /api/auth/login`, `GET /api/auth/me`; all other endpoints become authenticated-by-default (401 without a valid Bearer token). `/actuator/health` stays public (keeps existing smoke IT green).
- **Jira**: implements TSP-12 (F6); unblocks TSP-20/24/25/26 (I1, T1, T2, T3).