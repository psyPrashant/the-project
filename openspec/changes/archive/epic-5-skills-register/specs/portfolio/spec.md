## MODIFIED Requirements

### Requirement: Full portfolio view

The system SHALL expose `GET /api/employees/{employeeId}/portfolio` (authenticated) that returns a `PortfolioResponse` containing all education entries, projects, showcase links, **and skills** for the given employee, ordered consistently. The `skills` list is populated by calling `SkillService.getSkillsForEmployee(employeeId)` from within `PortfolioServiceImpl`.

Each skill entry in the portfolio response SHALL include: `skillId`, `skillName`, `years`, `projectCount`.

#### Scenario: Portfolio with data renders all sections including skills

- **WHEN** an employee has education, projects, links, and recorded skills
- **THEN** the full portfolio response contains all four lists including the skills section

#### Scenario: Empty portfolio renders empty-but-present sections including skills

- **WHEN** an employee has no portfolio data and no skills
- **THEN** the full portfolio response contains empty arrays for all four lists including skills

#### Scenario: Portfolio renders with skills but no other sections

- **WHEN** an employee has skills but no education, projects, or links
- **THEN** the skills list is populated and the other lists are empty arrays

### Requirement: Angular portfolio feature

The frontend SHALL provide a `PortfolioService` and a `PortfolioComponent` at `/employees/:id/portfolio`. The component SHALL render sections for education, projects, links, **and skills**, each supporting the appropriate actions (add/edit/delete for education/projects/links; add/delete for skills). Empty sections SHALL render without errors. The employee profile SHALL link to the portfolio view.

The skills section SHALL display each skill as a card/row showing `skillName`, `years` years of experience, and `projectCount` projects. A form to add a skill SHALL accept a skill name (text) and years (number). Deleting a skill removes it from the section.

#### Scenario: Portfolio view loads all sections including skills

- **WHEN** an authenticated user navigates to `/employees/:id/portfolio`
- **THEN** education, projects, links, and skills sections are all displayed

#### Scenario: Add skill through the UI

- **WHEN** a user fills and submits the add-skill form with a valid name and years
- **THEN** the skill entry appears in the skills section with the correct years and projectCount of 0

#### Scenario: Delete skill through the UI

- **WHEN** a user clicks delete on a skill entry
- **THEN** the skill is removed from the skills section
