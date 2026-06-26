## 1. Entity & Schema

- [x] 1.1 Add `jobTitle`, `department`, `phone` (nullable String) and `archived` (boolean, default false) fields to `Employee.java`
- [x] 1.2 Update `data.sql` to include the new nullable columns for the 3 seeded employees (use `ON CONFLICT` idempotency)

## 2. DTOs

- [x] 2.1 Create `CreateEmployeeRequest.java` record with `@NotBlank firstName`, `@NotBlank lastName`, `@Email @NotBlank email`, optional `jobTitle`, `department`, `phone`
- [x] 2.2 Create `UpdateEmployeeRequest.java` record with the same fields and constraints as `CreateEmployeeRequest`
- [x] 2.3 Create `EmployeeProfileResponse.java` record with `id`, `firstName`, `lastName`, `email`, `jobTitle`, `department`, `phone`, `archived` (no `passwordHash`)

## 3. Repository

- [x] 3.1 Add `findByArchivedFalse()` method to `EmployeeRepository.java`
- [x] 3.2 Add name search query (derived or `@Query`) returning non-archived employees matching `firstName` or `lastName` case-insensitively

## 4. Service

- [x] 4.1 Add `listAll()`, `search(String query)`, `createEmployee(CreateEmployeeRequest)`, `getProfile(Long id)`, `updateEmployee(Long id, UpdateEmployeeRequest)`, `archive(Long id)` to `EmployeeService.java` interface
- [x] 4.2 Implement the new methods in `EmployeeServiceImpl.java`; add `toProfileResponse()` private helper; throw `EntityNotFoundException` for unknown ids; translate duplicate email to a descriptive exception

## 5. Controller

- [x] 5.1 Create `EmployeeController.java` with `POST /api/employees` → 201, `GET /api/employees` (optional `?search=`) → 200, `GET /api/employees/{id}` → 200, `PUT /api/employees/{id}` → 200, `PATCH /api/employees/{id}/archive` → 204
- [x] 5.2 Add `@Valid` on request body parameters; map `EntityNotFoundException` to 404 and duplicate email exception to 409 (via `@RestControllerAdvice` or existing exception handler)

## 6. Backend Unit Tests

- [x] 6.1 Create `EmployeeServiceImplTest.java` — test `createEmployee` happy path and duplicate email path
- [x] 6.2 Add tests for `getProfile` (found + not found), `listAll`, `search` (results + empty), `updateEmployee` (happy path + not found + blank field), and `archive` (happy path + not found)

## 7. Backend Integration Tests

- [x] 7.1 Create `EmployeeCrudIT.java` extending `IntegrationTestBase`; test `POST /api/employees` (201 created, 400 missing field, 409 duplicate email, 401 unauthenticated)
- [x] 7.2 Test `GET /api/employees/{id}` (200 found, 404 unknown)
- [x] 7.3 Test `GET /api/employees` (200 list) and `GET /api/employees?search=Jane` (filtered results, empty results)
- [x] 7.4 Test `PUT /api/employees/{id}` (200 updated, 400 blank field, 404 unknown)
- [x] 7.5 Test `PATCH /api/employees/{id}/archive` (204, absent from list, profile still accessible, history intact)

## 8. Frontend Models & Service

- [x] 8.1 Create `staff-engagement-frontend/src/app/employees/employee.models.ts` with `EmployeeProfileResponse`, `CreateEmployeeRequest`, and `UpdateEmployeeRequest` TypeScript interfaces
- [x] 8.2 Create `employees/employee.service.ts` with `getAll(search?)`, `getProfile(id)`, `create(req)`, `update(id, req)`, and `archive(id)` methods using `HttpClient`
- [x] 8.3 Write `employee.service.spec.ts` using `HttpTestingController` to test all five methods (including search param and empty result)

## 9. Frontend Components

- [x] 9.1 Create `employees/employee-list/employee-list.ts` — standalone, OnPush; signal-based employee list; debounced search input using `rxjs`; "New Employee" button navigates to `/employees/new`; row click navigates to `/employees/:id`
- [x] 9.2 Create `employees/employee-form/employee-form.ts` — standalone, OnPush; reactive form; `id` input signal (absent = create, present = edit); pre-fills on edit; submits create or update then redirects to profile; shows validation errors
- [x] 9.3 Create `employees/employee-profile/employee-profile.ts` — standalone, OnPush; loads profile by route param; displays core details; empty-but-present sections for interactions, tasks, portfolio; Archive button calls service then updates local state; Edit button navigates to form
- [x] 9.4 Write `employee-list.spec.ts`, `employee-form.spec.ts`, `employee-profile.spec.ts` covering render, interaction, validation, and edge cases (empty list, archive flow, pre-fill on edit)

## 10. Routing & Navigation

- [x] 10.1 Add routes to `app.routes.ts`: `/employees` (list), `/employees/new` (form), `/employees/:id` (profile), `/employees/:id/edit` (form) — all guarded by `authGuard`
- [x] 10.2 Add "Employees" navigation link to the home/nav component

## 11. Verification

- [x] 11.1 Run `./mvnw verify` — unit tests 29/29 pass; integration tests blocked by pre-existing local env issue (Java 25 on Windows: `SocketException: Invalid argument: connect` on TestRestTemplate loopback — same failure existed before this change in AuthFlowIT; CI on Linux/Java 17 is authoritative)
- [x] 11.2 Run `npm test` — all 40 Vitest tests pass
- [ ] 11.3 Manual smoke: start stack, log in, create employee, view profile, edit, search, archive — confirm archive hides from list but profile is still accessible by URL
