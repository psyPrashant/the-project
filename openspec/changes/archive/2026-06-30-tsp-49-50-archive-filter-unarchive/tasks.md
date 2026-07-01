## 1. Backend — Unarchive Endpoint (TSP-50)

- [x] 1.1 Add `unarchive(Long id)` method to `EmployeeService` interface
- [x] 1.2 Implement `unarchive()` in `EmployeeServiceImpl`: find by id (throw `EntityNotFoundException` if not found), set `archived=false`, return `EmployeeProfileResponse`
- [x] 1.3 Add `PATCH /{id}/unarchive` handler to `EmployeeController` returning `ResponseEntity<EmployeeProfileResponse>` with HTTP 200
- [x] 1.4 Add unit tests to `EmployeeServiceImplTest`: unarchive sets flag to false, unarchive unknown id throws `EntityNotFoundException`
- [x] 1.5 Add integration test to `EmployeeControllerIT`: archive then unarchive an employee, verify 200 + `archived=false`; verify 404 for unknown id; verify 401 for unauthenticated

## 2. Backend — Archive Filter (TSP-49)

- [x] 2.1 Add `findAll(String query)` or `searchAllByName(String query)` method(s) to `EmployeeRepository` (variants without the `archived=false` filter)
- [x] 2.2 Update `EmployeeServiceImpl.getEmployees()` to accept a boolean `includeArchived` parameter; when true, call the new repository methods; when false, keep existing behaviour
- [x] 2.3 Update `EmployeeController.getEmployees()` to accept `@RequestParam(defaultValue = "false") boolean includeArchived` and pass it to the service
- [x] 2.4 Add unit tests for the `includeArchived=true` branch in `EmployeeServiceImplTest`
- [x] 2.5 Add integration test in `EmployeeControllerIT`: verify `?includeArchived=true` returns both active and archived employees; verify default still excludes archived

## 3. Frontend — Unarchive (TSP-50)

- [x] 3.1 Add `unarchive(id: number): Observable<EmployeeProfileResponse>` to `EmployeeService` (PATCH to `/employees/{id}/unarchive`)
- [x] 3.2 Add `unarchiving` signal to `EmployeeProfileComponent`; implement `unarchive()` method mirroring the existing `archive()` pattern; on success update local employee signal with `archived: false`
- [x] 3.3 Add "Unarchive" button in the profile template: visible only `@if (emp.archived)`, disabled during `unarchiving()`, shows "Unarchiving…" while in flight
- [x] 3.4 Update `employee-profile.spec.ts`: test Unarchive button visibility for archived/active states; test successful unarchive updates profile in place; test Archive/Unarchive mutual exclusivity

## 4. Frontend — Archive Filter Toggle (TSP-49)

- [x] 4.1 Add `showArchived` boolean signal (default `false`) to `EmployeeListComponent`
- [x] 4.2 Update the employees reactive pipeline: when `showArchived()` is true, call `employeeService.getAll(query, true)` (passes `?includeArchived=true`); when false, keep existing call
- [x] 4.3 Update `EmployeeService.getAll()` to accept optional `includeArchived?: boolean` param and append `?includeArchived=true` to the URL when set
- [x] 4.4 Add "Show archived" toggle to the `EmployeeListComponent` template (checkbox or toggle button), bound to `showArchived` signal; re-trigger the pipeline on change
- [x] 4.5 Ensure the "Archived" badge already in the list template renders correctly for archived employees when toggle is on
- [x] 4.6 Update `employee-list.spec.ts`: test toggle off hides archived employees; test toggle on shows them with badge; test search still works with toggle on

## 5. e2e Tests

- [x] 5.1 Add Playwright test in `people.spec.ts`: verify "Show archived" toggle off hides archived employees and toggle on shows them
- [x] 5.2 Add Playwright test in `people.spec.ts`: archive an employee then use toggle to find them in the list; navigate to profile and unarchive; verify profile updates in place and Archive button returns
