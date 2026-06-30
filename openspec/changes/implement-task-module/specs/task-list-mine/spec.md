## ADDED Requirements

### Requirement: View my tasks
The system SHALL provide an endpoint that returns all tasks where the current authenticated user is the subject (`relatesTo = current user`). The list SHALL include tasks regardless of who created them.

#### Scenario: Returns tasks relating to current user across all creators
- **WHEN** tasks exist with `relatesTo = current user` created by three different employees
- **THEN** the endpoint returns all three tasks

#### Scenario: Excludes tasks relating to other employees
- **WHEN** tasks exist with `relatesTo = another employee`
- **THEN** those tasks do not appear in the current user's list

#### Scenario: Empty list when no tasks relate to current user
- **WHEN** no tasks have `relatesTo = current user`
- **THEN** the endpoint returns an empty list with HTTP 200

#### Scenario: Includes both open and done tasks
- **WHEN** the current user has tasks in OPEN and DONE status
- **THEN** both statuses are returned in the list
