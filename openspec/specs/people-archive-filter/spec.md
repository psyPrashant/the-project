# people-archive-filter Specification

## Purpose
Defines the "Show archived" toggle on the People list that allows users to optionally reveal archived employees with a badge, while keeping search functional across both active and archived records.

## Requirements

### Requirement: Show archived toggle on People list
The `EmployeeListComponent` SHALL provide a "Show archived" toggle (boolean, default off). When off, only active employees are displayed. When on, all employees (active and archived) are displayed. The toggle state SHALL be a local signal — it is not persisted across navigation.

#### Scenario: Toggle defaults to off — archived employees hidden
- **WHEN** an authenticated user navigates to `/employees`
- **THEN** the toggle is off and only active employees are visible in the list

#### Scenario: Toggle on — archived employees appear with badge
- **WHEN** the user switches the toggle on
- **THEN** archived employees appear in the list each with an "Archived" badge alongside their name

#### Scenario: Toggle off again — archived employees hidden
- **WHEN** the user switches the toggle back off after it was on
- **THEN** archived employees are no longer visible in the list

### Requirement: Search works when show-archived toggle is on
When the "Show archived" toggle is on, the search query SHALL filter across both active and archived employees.

#### Scenario: Search across active and archived employees
- **WHEN** the "Show archived" toggle is on and the user types a search term
- **THEN** matching employees from both active and archived sets are shown

#### Scenario: Search with toggle off only returns active results
- **WHEN** the "Show archived" toggle is off and the user types a search term
- **THEN** only matching active employees are shown (archived are excluded regardless of name match)

### Requirement: Backend list endpoint supports includeArchived parameter
`GET /api/employees` SHALL accept an optional `?includeArchived=true` query parameter. When absent or false, only non-archived employees are returned (existing behaviour). When `true`, all employees (archived and non-archived) are returned, still honoring the optional `?search=` filter across all records.

#### Scenario: Default list excludes archived
- **WHEN** `GET /api/employees` is called without `includeArchived`
- **THEN** only non-archived employees are returned

#### Scenario: includeArchived=true returns all employees
- **WHEN** `GET /api/employees?includeArchived=true` is called
- **THEN** both active and archived employees are returned

#### Scenario: includeArchived=true with search filters across all employees
- **WHEN** `GET /api/employees?includeArchived=true&search=Jane` is called
- **THEN** employees matching "Jane" from both active and archived sets are returned
