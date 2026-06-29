## ADDED Requirements

### Requirement: Employee can log an interaction against another employee
The system SHALL allow an authenticated employee to record an interaction that references a subject employee, a note body, an interaction type, and a date.

#### Scenario: Successful interaction log
- **WHEN** an authenticated employee submits a valid interaction with a subject employee, note body, type, and date
- **THEN** the interaction is persisted with `author` set to the current employee and `subject` set to the selected employee

#### Scenario: Self-interaction is valid
- **WHEN** an authenticated employee submits an interaction where the subject is themselves
- **THEN** the interaction is persisted as a valid self-interaction with `author` and `subject` both set to the current employee

#### Scenario: Missing note body is rejected
- **WHEN** an authenticated employee submits an interaction with no note body
- **THEN** the system returns a validation error and the interaction is not persisted

#### Scenario: Missing subject employee is rejected
- **WHEN** an authenticated employee submits an interaction without a subject employee
- **THEN** the system returns a validation error and the interaction is not persisted
