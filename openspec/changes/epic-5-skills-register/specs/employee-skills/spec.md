## ADDED Requirements

### Requirement: Canonical Skill entity

The system SHALL maintain a `Skill` table of deduplicated skill names. A `Skill` has a `name` (String, not null, unique case-insensitively). When any operation supplies a skill name, the system SHALL look up by `LOWER(name)`; if found it reuses the existing `Skill`, otherwise it creates a new one. The canonical name is stored as supplied on first creation.

#### Scenario: New skill name creates a canonical Skill

- **WHEN** an employee skill is added with a skill name that does not yet exist in the register
- **THEN** a new `Skill` record is created and the `EmployeeSkill` references it

#### Scenario: Existing skill name reuses the canonical Skill

- **WHEN** an employee skill is added with a name that already exists (case-insensitive match)
- **THEN** no new `Skill` record is created and the `EmployeeSkill` references the existing one

#### Scenario: Skill name differing only in case reuses canonical Skill

- **WHEN** "Java" exists in the register and a new skill is added with name "java"
- **THEN** the existing `Skill` for "Java" is reused

### Requirement: EmployeeSkill persistence

The system SHALL persist an `EmployeeSkill` linking an `Employee` to a `Skill` with a user-entered `years` field (positive integer, min 0, required). Each employee-skill combination SHALL be unique; submitting a duplicate SHALL be rejected with HTTP 409.

#### Scenario: Valid employee skill is persisted

- **WHEN** a `POST /api/employees/{id}/skills` is submitted with a valid skill name and years >= 0
- **THEN** the response is HTTP 201 and the skill appears in the employee's skill list

#### Scenario: Duplicate employee skill is rejected

- **WHEN** a skill already recorded for an employee is submitted again (same skill name, case-insensitive)
- **THEN** the response is HTTP 409 and no duplicate record is created

#### Scenario: Negative years are rejected

- **WHEN** a skill is submitted with `years` = -1
- **THEN** the response is HTTP 400

#### Scenario: Missing years field is rejected

- **WHEN** a skill is submitted without the `years` field
- **THEN** the response is HTTP 400

#### Scenario: Skill for unknown employee returns 404

- **WHEN** `POST /api/employees/{id}/skills` is called for a non-existent employee id
- **THEN** the response is HTTP 404

### Requirement: Employee skill update

The system SHALL expose `PUT /api/employees/{employeeId}/skills/{skillId}` to update the `years` value of an existing `EmployeeSkill`. The skill name itself is not changeable via update; to change it the caller must delete and re-add.

#### Scenario: Update years on existing employee skill

- **WHEN** a valid `PUT` is submitted with a new `years` value
- **THEN** the response is HTTP 200 and the updated years value is returned

#### Scenario: Update for non-existent employee skill returns 404

- **WHEN** `PUT /api/employees/{employeeId}/skills/{skillId}` references a non-existent skill entry
- **THEN** the response is HTTP 404

### Requirement: Employee skill removal

The system SHALL expose `DELETE /api/employees/{employeeId}/skills/{skillId}` to remove an `EmployeeSkill`. Removing an `EmployeeSkill` SHALL cascade-delete all its project links in `employee_skill_project`.

#### Scenario: Delete existing employee skill

- **WHEN** a valid `DELETE` is submitted for an existing employee skill
- **THEN** the response is HTTP 204 and the skill no longer appears in the employee's list

#### Scenario: Delete for non-existent employee skill returns 404

- **WHEN** `DELETE /api/employees/{employeeId}/skills/{skillId}` references a non-existent entry
- **THEN** the response is HTTP 404

### Requirement: Project linking for derived projectCount

The system SHALL expose endpoints to link and unlink a portfolio `Project` to an `EmployeeSkill`. The count of linked projects (`projectCount`) is derived from these links and is never stored on `EmployeeSkill`. The system SHALL validate the project exists (via `PortfolioService`) before linking.

- `POST /api/employees/{employeeId}/skills/{skillId}/projects/{projectId}` — link, returns 200.
- `DELETE /api/employees/{employeeId}/skills/{skillId}/projects/{projectId}` — unlink, returns 204.

`projectCount` SHALL appear in all `EmployeeSkillResponse` and search result payloads.

#### Scenario: Link a project to an employee skill

- **WHEN** a valid project id belonging to the employee is linked to an employee skill
- **THEN** the response is HTTP 200 and `projectCount` in the response is incremented

#### Scenario: Link non-existent project returns 404

- **WHEN** a project id that does not exist is submitted for linking
- **THEN** the response is HTTP 404

#### Scenario: Duplicate project link is idempotent

- **WHEN** the same project is linked to the same employee skill a second time
- **THEN** the response is HTTP 200 and `projectCount` is not double-counted

#### Scenario: Unlink a project from an employee skill

- **WHEN** a linked project is removed via DELETE
- **THEN** the response is HTTP 204 and `projectCount` decreases by one

### Requirement: Employee skill list

The system SHALL expose `GET /api/employees/{employeeId}/skills` returning all `EmployeeSkill` entries for an employee, each with `skillId`, `skillName`, `years`, and derived `projectCount`.

#### Scenario: Employee with skills returns full list

- **WHEN** `GET /api/employees/{id}/skills` is called for an employee with recorded skills
- **THEN** the response is HTTP 200 with all skills and their projectCounts

#### Scenario: Employee with no skills returns empty list

- **WHEN** `GET /api/employees/{id}/skills` is called for an employee with no skills
- **THEN** the response is HTTP 200 with an empty array

#### Scenario: Skills list for unknown employee returns 404

- **WHEN** `GET /api/employees/{id}/skills` is called for a non-existent employee
- **THEN** the response is HTTP 404
