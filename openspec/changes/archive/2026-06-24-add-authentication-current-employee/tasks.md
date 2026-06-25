## 1. Backend dependencies & config

- [x] 1.1 Add `spring-boot-starter-security`, `spring-boot-starter-validation`, `jjwt-api` (0.12.6), `jjwt-impl` + `jjwt-jackson` (0.12.6, runtime), and `spring-security-test` (test) to `staff-engagement-backend/pom.xml`
- [x] 1.2 Add JWT secret/expiry, SQL-init, and actuator-exposure keys to `src/main/resources/application.properties`
- [x] 1.3 Add `spring.sql.init.mode=always` + `spring.jpa.defer-datasource-initialization=true` to `src/test/resources/application.properties` (shadows main)

## 2. employee module (identity slice)

- [x] 2.1 Create `Employee` entity (`id`, `firstName`, `lastName`, `email` unique, `passwordHash`) with JPA + Lombok annotations
- [x] 2.2 Create `EmployeeRepository` extending `JpaRepository<Employee, Long>` with `findByEmail`
- [x] 2.3 Create `EmployeeService` interface (`findByEmail`, `findById`) and `EmployeeServiceImpl` (`@Transactional(readOnly=true)` reads)
- [x] 2.4 Create `EmployeeResponse` record (id, email, firstName, lastName — no passwordHash) and a mapper

## 3. Seed Employees

- [x] 3.1 Generate pre-computed BCrypt hashes (strength 10) for the seeded passwords
- [x] 3.2 Create `src/main/resources/data.sql` with 3 Employees and `INSERT ... ON CONFLICT (email) DO NOTHING`

## 4. auth module (security, JWT, login, resolver)

- [x] 4.1 Create `EmployeePrincipal` record implementing `UserDetails` (employeeId, email, passwordHash, `ROLE_EMPLOYEE`)
- [x] 4.2 Create `EmployeeUserDetailsService` loading via `EmployeeService.findByEmail`, throwing `UsernameNotFoundException`
- [x] 4.3 Create `JwtService` (jjwt 0.12 API) with injectable `Clock`, secret from `app.jwt.secret`, expiry from `app.jwt.expiry-minutes`
- [x] 4.4 Create `JwtAuthenticationFilter` (`OncePerRequestFilter`) resolving Employee via `EmployeeService.findById` and setting `SecurityContextHolder`
- [x] 4.5 Create `SecurityConfig` (stateless, CSRF off, CORS for :4200, permit login+health, `addFilterBefore`, `BCryptPasswordEncoder`, `AuthenticationManager` beans)
- [x] 4.6 Create `@CurrentEmployee` annotation + `CurrentEmployeeArgumentResolver` + register via `WebMvcConfigurer`
- [x] 4.7 Create `LoginRequest` (`@Email @NotBlank`, `@NotBlank`) and `AuthResponse` DTOs
- [x] 4.8 Create `AuthController` (`POST /api/auth/login` via `AuthenticationManager`, `GET /api/auth/me` via `@CurrentEmployee`)
- [x] 4.9 Create `GlobalExceptionHandler` `@RestControllerAdvice` + `ErrorResponse` record (401/400/403/404/500 mappings)

## 5. Backend tests (unit + integration)

- [x] 5.1 `JwtServiceTest` — generate/parse round-trip; invalid/tampered/expired (advance Clock) return false
- [x] 5.2 `EmployeeUserDetailsServiceTest` — existing → `EmployeePrincipal`; missing → `UsernameNotFoundException`
- [x] 5.3 `AuthControllerTest` (`@WebMvcTest` + mocks) — login 200+`AuthResponse`, invalid creds 401, blank field 400
- [x] 5.4 `CurrentEmployeeArgumentResolverTest` — resolves from populated context; throws when no auth
- [x] 5.5 `SecurityConfigTest` (MockMvc slice) — `/me` no token 401, valid token 200, malformed 401, login+health permitted 200
- [x] 5.6 `AuthFlowIT` (extends `IntegrationTestBase`, TestRestTemplate) — valid creds 200+token+employee; invalid 401; `/me` with token 200; `/me` no token 401; malformed 401; health 200; assert 3 seeded employees
- [x] 5.7 Confirm `BackendApiSmokeIT` still green (health permitted)

## 6. Frontend (login UI, interceptor, guard)

- [x] 6.1 Create `src/environments/environment.ts` (+ `.prod.ts`) with `apiUrl`
- [x] 6.2 Add `provideHttpClient(withInterceptors([authInterceptor]))` to `app.config.ts`
- [x] 6.3 Create `AuthService` (`providedIn: 'root'`, `inject(HttpClient)`, signals, `localStorage['se_token']`, `login`/`loadCurrentUser`/`logout`/`isAuthenticated`)
- [x] 6.4 Create `authInterceptor` functional interceptor (Bearer injection, skip `/auth/login`, 401 → logout+redirect)
- [x] 6.5 Create `authGuard` `CanActivateFn` redirecting to `/login?redirect=`
- [x] 6.6 Create `LoginComponent` (reactive form, OnPush, `inject()`, Tailwind, WCAG AA, no ngClass)
- [x] 6.7 Create `HomeComponent` guarded "Welcome, {firstName}" landing
- [x] 6.8 Wire `app.routes.ts`: `'' → /home`, `/login` public, `/home` guarded

## 7. Frontend tests (Vitest + Playwright)

- [x] 7.1 `auth.service.spec.ts` — login success stores token+user, failure stores nothing, `loadCurrentUser` populates, `logout` clears
- [x] 7.2 `auth.interceptor.spec.ts` — no token → no header, token → Bearer, `/auth/login` skipped, 401 → logout
- [x] 7.3 `auth.guard.spec.ts` — authenticated → true, unauthenticated → redirect to `/login`
- [x] 7.4 `login.spec.ts` — form invalid when empty / valid when filled, submit calls service, success navigates, error on 401
- [x] 7.5 `e2e/app.spec.ts` — login renders, valid creds → redirect to `/home`+welcome, invalid creds → error, `/home` unauthenticated → redirect to `/login` (run against live backend+db: 4 passed)

## 8. Verify & finalize

- [x] 8.1 Backend: `./mvnw -ntp verify` green (unit + Failsafe IT against Testcontainers)
- [x] 8.2 Frontend: `npm test` (Vitest) + `npm run e2e` (Playwright) green (15 Vitest + 4 Playwright)
- [x] 8.3 Manual smoke: log in as a seeded Employee via the UI, confirm `/home` welcome; wrong password shows error (verified via e2e + live login probe: admin@psybergate.com/password123 → token+employee; wrong → 401)
- [ ] 8.4 Push/PR to `main` — both CI jobs green (pending user commit/push decision)
- [x] 8.5 `openspec archive` the change; transition Jira TSP-12 to Done