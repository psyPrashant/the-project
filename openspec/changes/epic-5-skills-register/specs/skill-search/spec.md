## ADDED Requirements

### Requirement: Ranked skill search

The system SHALL expose `GET /api/skills/search?skill={name}` (authenticated) that returns a list of employees who have that skill, ranked by `years` descending, then `projectCount` descending (most experienced first; ties broken by breadth of projects). The match is case-insensitive on the canonical skill name. The response per entry SHALL include `employeeId`, `employeeName`, `years`, and `projectCount`.

#### Scenario: Ranked results return correct order

- **WHEN** multiple employees have the same skill with different years and projectCounts
- **THEN** the response is HTTP 200 and entries are ordered by years desc, then projectCount desc

#### Scenario: Tie on years broken by projectCount

- **WHEN** two employees share the same skill and the same years but different projectCounts
- **THEN** the employee with the higher projectCount appears first

#### Scenario: Search for skill nobody has returns empty list

- **WHEN** `GET /api/skills/search?skill=COBOL` is called and no employee has that skill
- **THEN** the response is HTTP 200 with an empty array (not 404)

#### Scenario: Search is case-insensitive

- **WHEN** `GET /api/skills/search?skill=angular` is called and the canonical skill is stored as "Angular"
- **THEN** the matching employees are returned

#### Scenario: Missing skill query parameter returns 400

- **WHEN** `GET /api/skills/search` is called without the `skill` parameter
- **THEN** the response is HTTP 400

### Requirement: Browse the skills register

The system SHALL expose `GET /api/skills` (authenticated) returning all canonical `Skill` entries with their name and the count of employees who hold that skill (`employeeCount`). The list SHALL be ordered by name ascending.

#### Scenario: Register with skills returns full list ordered by name

- **WHEN** `GET /api/skills` is called and the register has entries
- **THEN** the response is HTTP 200 with all canonical skills ordered alphabetically, each with name and employeeCount

#### Scenario: Empty register returns empty list

- **WHEN** `GET /api/skills` is called and no skills have been recorded
- **THEN** the response is HTTP 200 with an empty array

#### Scenario: employeeCount reflects current employees holding the skill

- **WHEN** an employee skill is deleted
- **THEN** the `employeeCount` for that skill decreases in the register browse response
