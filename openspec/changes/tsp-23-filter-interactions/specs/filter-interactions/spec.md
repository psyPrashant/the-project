# filter-interactions Specification

## Purpose

Defines the optional filtering behavior for an employee's interaction timeline. Filters are applied server-side so the UI can request a focused subset of interactions without loading the full history.

## Requirements

### Requirement: Filter timeline by interaction type

The system SHALL support an optional `type` query parameter on `GET /api/interactions`. When supplied, the response SHALL only include interactions whose `type` exactly matches the provided value. The parameter value SHALL be one of the existing `InteractionType` enum values (`NOTE`, `CALL`, `MEETING`, `EMAIL`). An unknown or invalid `type` SHALL result in an empty response or HTTP 400; the endpoint SHALL NOT return interactions of a different type.

#### Scenario: Filter by type returns matching interactions

- **WHEN** an authenticated user requests `GET /api/interactions?subjectId=1&type=MEETING`
- **THEN** the response is HTTP 200 with only interactions for subject `1` whose type is `MEETING`

#### Scenario: Filter by type with no matches

- **WHEN** an authenticated user requests `GET /api/interactions?subjectId=1&type=CALL` and the subject has no `CALL` interactions
- **THEN** the response is HTTP 200 with an empty array

### Requirement: Filter timeline by author

The system SHALL support an optional `authorId` query parameter on `GET /api/interactions`. When supplied, the response SHALL only include interactions whose author's employee id matches the provided value. The parameter SHALL be a positive integer. The filter SHALL be combinable with other filters.

#### Scenario: Filter by author returns only their interactions

- **WHEN** an authenticated user requests `GET /api/interactions?subjectId=1&authorId=2`
- **THEN** the response is HTTP 200 with only interactions for subject `1` authored by employee `2`

#### Scenario: Filter by author with no matches

- **WHEN** an authenticated user requests `GET /api/interactions?subjectId=1&authorId=999` and that author has no interactions for the subject
- **THEN** the response is HTTP 200 with an empty array

### Requirement: Filter timeline by date

The system SHALL support an optional `date` query parameter on `GET /api/interactions`. When supplied, the response SHALL only include interactions whose interaction date equals the provided ISO date (`YYYY-MM-DD`). The filter SHALL be combinable with other filters.

#### Scenario: Filter by date returns matching interactions

- **WHEN** an authenticated user requests `GET /api/interactions?subjectId=1&date=2026-06-25`
- **THEN** the response is HTTP 200 with only interactions for subject `1` dated `2026-06-25`

#### Scenario: Filter by date with no matches

- **WHEN** an authenticated user requests `GET /api/interactions?subjectId=1&date=2026-06-01` and the subject has no interactions on that date
- **THEN** the response is HTTP 200 with an empty array

### Requirement: Combine multiple filters

The system SHALL apply all supplied filters together as a logical AND. The response SHALL include only interactions that satisfy every supplied filter simultaneously. The endpoint SHALL remain backward-compatible: calling `GET /api/interactions?subjectId={id}` with no additional filters returns the full timeline for that subject, identical to the previous behavior.

#### Scenario: Combine type and author filters

- **WHEN** an authenticated user requests `GET /api/interactions?subjectId=1&type=NOTE&authorId=2`
- **THEN** the response is HTTP 200 with only `NOTE` interactions for subject `1` authored by employee `2`

#### Scenario: No filters beyond subject returns full timeline

- **WHEN** an authenticated user requests `GET /api/interactions?subjectId=1`
- **THEN** the response is HTTP 200 with all interactions for subject `1`, sorted by date descending

### Requirement: Angular filter UI

The frontend SHALL provide filter controls on the interaction timeline page. The controls SHALL allow the user to select an interaction type from a dropdown, enter or pick an author, and enter or pick a date. The controls SHALL trigger a fresh request to `GET /api/interactions` with the chosen non-empty filters. The timeline list SHALL refresh to show only matching interactions. A reset action SHALL clear the filters and reload the full timeline.

#### Scenario: User filters by type in the UI

- **WHEN** an authenticated user selects `MEETING` from the type filter and applies it
- **THEN** the timeline reloads and displays only `MEETING` interactions for the subject

#### Scenario: User resets filters in the UI

- **WHEN** an authenticated user clicks the reset action
- **THEN** all filter controls are cleared and the timeline reloads with the full subject timeline

### Requirement: Filter DTOs remain unchanged

The filtering change SHALL reuse the existing `InteractionResponseDto`. No new response fields are required for filtering; the same response shape is returned with a possibly shorter list.

#### Scenario: Filtered response shape is unchanged

- **WHEN** an authenticated user requests a filtered timeline
- **THEN** each item in the response has the same fields as an unfiltered timeline item
