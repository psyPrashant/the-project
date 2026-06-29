# edit-delete-own-interaction Specification

## Purpose
TBD - created by archiving change epic-2-interactions. Update Purpose after archive.
## Requirements
### Requirement: Author can edit their own interaction
The system SHALL allow the author of an interaction to update the note body, type, and date.

#### Scenario: Author edits interaction
- **WHEN** the author submits an update to an existing interaction they authored
- **THEN** the interaction is updated and the system returns the updated interaction

#### Scenario: Non-author cannot edit
- **WHEN** an authenticated employee who is not the author attempts to update an interaction
- **THEN** the system returns a 403 forbidden error and the interaction is unchanged

#### Scenario: Edit with missing note body is rejected
- **WHEN** the author submits an edit that clears the note body
- **THEN** the system returns a validation error and the interaction is unchanged

### Requirement: Author can delete their own interaction
The system SHALL allow the author of an interaction to delete it.

#### Scenario: Author deletes interaction
- **WHEN** the author requests deletion of an interaction they authored
- **THEN** the interaction is removed and the system returns a 204 no content response

#### Scenario: Non-author cannot delete
- **WHEN** an authenticated employee who is not the author attempts to delete an interaction
- **THEN** the system returns a 403 forbidden error and the interaction is unchanged

