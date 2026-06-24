## Context

The backend is an empty Spring Boot 3.5.15 skeleton (`StaffEngagementBackendApplication` only) with a Testcontainers-Postgres-wired test base (`IntegrationTestBase`, `@ServiceConnection`, reused singleton container, `*IT` run by Failsafe). No Employee entity, no controllers, no security, no exception handler exist. The Angular 21 frontend is a bare CLI scaffold (`provideRouter([])` only; no `provideHttpClient`, no auth, no environments). OpenSpec is initialized but empty. This change lands the first real code in both tiers: identity + auth.

Constraints: modular-monolith layering (Controller → Service interface → ServiceImpl → Repository; cross-module calls via service interfaces only); constructor injection (`@RequiredArgsConstructor`); `open-in-view=false`; DTOs never expose entities; D3 (every user is an Employee); D4 (POC permissions — no RBAC); D6 (no self-service/pagination/RBAC); BIG testing focus with negative paths.

## Goals / Non-Goals

**Goals:**
- Issue a stateless JWT on valid login and resolve the caller to an Employee (D3).
- Reject invalid credentials with 401 and no session.
- Refuse unauthenticated requests to any endpoint except the explicitly permitted ones.
- Provide a clean way for controllers to receive the resolved current Employee without leaking Spring Security types.
- Seed a small set of Employees with BCrypt-hashed passwords for local/test login.
- Provide a usable Angular login UI with token handling, a guard, and an interceptor.
- Cover the feature with unit, integration, and e2e tests including negative paths.

**Non-Goals:**
- RBAC/roles/authorities beyond a single `ROLE_EMPLOYEE` placeholder (D4/D6).
- Account self-service, registration, password reset, email verification (D6).
- Refresh tokens / token revocation / sliding sessions.
- Pagination, audit history beyond `createdBy`/timestamps, notifications (D6).
- An Employee CRUD/management endpoint in this change.

## Decisions

### D1 — JWT (stateless) over session cookies
Stateless JWT via `jjwt` 0.12.x suits the Angular SPA + Spring Boot split: no server-side session store, trivial to test over REST, CORS-friendly. Alternative: Spring session cookies — simpler CSRF story but needs session storage and CSRF config for the SPA; rejected for POC simplicity. Token stored in `localStorage` on the frontend (POC acceptable; not the production-secure choice of httpOnly cookie).

### D2 — Two modules: `employee` (identity slice) + `auth`
`employee` owns the `Employee` entity, repository, service interface/impl, and response DTO. `auth` owns security config, JWT, the filter, the user-details service, the login/me controller, the `@CurrentEmployee` resolver, DTOs, and the exception handler. `auth` depends on `EmployeeService` (the interface) — never the repository — honouring the cross-module-via-service-interface rule. The Employee entity is intentionally minimal here (identity fields only); later epics extend it.

### D3 — Resolve current Employee via `@CurrentEmployee` argument resolver (not `@AuthenticationPrincipal`)
The `JwtAuthenticationFilter` loads the Employee fresh from `EmployeeService.findById(employeeId)` on each request (keeps identity authoritative, D3) and sets an `EmployeePrincipal`-backed `Authentication` on the `SecurityContextHolder`. Controllers ask for `@CurrentEmployee Employee`, which a `HandlerMethodArgumentResolver` supplies from the security context. This keeps Spring Security types out of domain controllers and gives a single, unit-testable enforcement point for "every user is an Employee." Alternative: controllers take `@AuthenticationPrincipal EmployeePrincipal` and call the service themselves — rejected because it leaks Spring Security into controllers.

### D4 — JWT subject = `employeeId`, claim `email`; secret env-overridable
Subject is the Employee PK (single indexed lookup on resolution); `email` is a claim for display. Secret stored in `app.jwt.secret` (base64, ≥32 bytes for HS256), overridden by `JWT_SECRET` env in production. Expiry `app.jwt.expiry-minutes` (default 480 / 8h). `JwtService` takes an injectable `Clock` so the expiry negative test can advance time.

### D5 — Seeding via `data.sql` + `spring.sql.init.mode=always` + `defer-datasource-initialization=true`
`data.sql` holds 3 Employees with **pre-computed BCrypt** hashes (strength 10, matching the `PasswordEncoder` bean) and `INSERT ... ON CONFLICT (email) DO NOTHING` for idempotency against main's `ddl-auto=update` and the reused Testcontainers container. `defer-datasource-initialization=true` ensures Hibernate DDL runs before `data.sql`. **Critical**: the test `application.properties` shadows the main one, so the SQL-init keys MUST be added to **both** files or integration tests find no seeded Employees. Alternatives: Flyway (adds a dependency/migration files — overkill for 3 rows), `CommandLineRunner` hashing plain passwords at startup (less realistic, re-runs each boot) — both rejected.

### D6 — Security config
`SecurityFilterChain`: permit `/api/auth/login` and `/actuator/health`; `anyRequest().authenticated()`; `SessionCreationPolicy.STATELESS`; CSRF disabled; CORS allowing `localhost:4200` incl. OPTIONS/preflight; `addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)`. Beans: `BCryptPasswordEncoder`, `AuthenticationManager`. Only `health` is exposed on actuator. The existing `BackendApiSmokeIT` (GET `/actuator/health`) stays green.

### D7 — Global error contract
`@RestControllerAdvice` maps `BadCredentialsException`/`JwtAuthException` → 401, validation failures → 400, `AccessDeniedException` → 403, `EntityNotFoundException` → 404, fallback → 500, all as `ErrorResponse{status, message, timestamp}`. Consistent shape for the frontend.

### D8 — Frontend structure
`environments` provide `apiUrl` (`http://localhost:8080/api` dev). `provideHttpClient(withInterceptors([authInterceptor]))`. `AuthService` (`providedIn: 'root'`, `inject(HttpClient)`, signals for current user, `localStorage` token). Functional `authInterceptor` injects `Bearer`, skips `/auth/login`, logs out on 401. `authGuard` (`CanActivateFn`) redirects to `/login?redirect=`. `LoginComponent` reactive form, OnPush, Tailwind, WCAG AA. `HomeComponent` proves auth. Routes: `'' → /home`, `/login` public, `/home` guarded.

## Risks / Trade-offs

- **`localStorage` token** → XSS exposes the token. Mitigation: acceptable for POC; document the production path (httpOnly cookie + CSRF) as future work.
- **Test `application.properties` shadows main** → seeded data missing in tests. Mitigation: add SQL-init keys to both files; `AuthFlowIT` asserts seeded employees exist.
- **`data.sql` re-run on reused container / `ddl-auto=update`** → duplicate-key failures. Mitigation: `ON CONFLICT (email) DO NOTHING`.
- **JWT secret committed as dev default** → secret leakage if used in prod. Mitigation: env override required; secret clearly marked dev-only.
- **Clock skew / expiry** → tokens rejected too early/late. Mitigation: injectable `Clock` in `JwtService`; dedicated expired-token test.
- **`open-in-view=false` + filter loading Employee** → lazy-loading outside transactions. Mitigation: filter resolves via `EmployeeService` with `@Transactional(readOnly=true)`, never the repository directly.
- **CORS preflight to protected endpoints** → OPTIONS must pass. Mitigation: `CorsConfigurationSource` allows OPTIONS; `cors()` enabled in the chain.
- **All endpoints become authenticated-by-default** → existing/other future endpoints need tokens. Mitigation: intended behavior (F6 AC #3); only login + health are public.