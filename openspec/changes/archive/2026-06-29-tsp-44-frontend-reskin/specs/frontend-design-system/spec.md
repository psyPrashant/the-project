# Frontend Design System Specification

## Purpose

Defines the "Engage" frontend re-skin: a unified app shell, shared design tokens, re-skinned
Login/People/Profile screens, modal-driven create/edit, and "coming soon" placeholders for
screens whose backend does not yet exist. Frontend-only; no API or data-model changes.

## Requirements

### Requirement: Design tokens

The frontend SHALL define the concept's palette, radii, and shadows as Tailwind 4 `@theme`
tokens in `src/styles.css` so the visual language is applied consistently across screens, and
SHALL provide deterministic `avatarColor`/`initials` helpers and an interaction-type → badge
style helper that tolerates unknown types.

#### Scenario: Tokens are applied app-wide

- **WHEN** the application is built
- **THEN** the brand colour, neutral surfaces, and card styling from the concept are available
  as utilities and used by the shell and re-skinned screens

#### Scenario: Avatar colour is stable per employee

- **WHEN** the same employee is rendered in different places
- **THEN** their avatar colour is identical, derived deterministically from their id

#### Scenario: Unknown interaction type degrades gracefully

- **WHEN** an interaction has a type not in the known set
- **THEN** a neutral badge is shown and no error occurs

### Requirement: Authenticated app shell

The frontend SHALL render an authenticated app shell with a fixed sidebar containing the
brand, navigation to My Dashboard, People, Skills Register, and My Tasks with active-state
styling, and a footer showing the resolved current user with a Sign out action. The prototype
user-switcher SHALL NOT be implemented.

#### Scenario: Shell shows the signed-in user

- **WHEN** an authenticated user loads any in-shell route
- **THEN** the sidebar footer shows their name/avatar and a Sign out control

#### Scenario: Active nav reflects the route

- **WHEN** the user navigates to a section
- **THEN** the corresponding sidebar item is shown in its active state

#### Scenario: Sign out

- **WHEN** the user activates Sign out
- **THEN** the session is cleared and they are returned to the login screen

#### Scenario: Login is outside the shell

- **WHEN** an unauthenticated user is redirected to login
- **THEN** the sidebar shell is not rendered

### Requirement: Coming-soon placeholders

The frontend SHALL provide a reusable placeholder for screens whose backend is not yet built,
and SHALL route `/dashboard`, `/skills`, and `/tasks` to it, and SHALL render it for the Tasks
and Skills sections of the employee profile. Placeholders SHALL NOT display mocked data.

#### Scenario: Placeholder routes resolve

- **WHEN** the user opens My Dashboard, Skills Register, or My Tasks
- **THEN** an "under construction" placeholder naming that screen is shown, not an error

#### Scenario: Profile placeholder sections

- **WHEN** the user views an employee profile
- **THEN** the Tasks and Skills sections show the coming-soon placeholder while the other
  sections show real data

### Requirement: People list as cards

The People screen SHALL present employees as cards (avatar, name, role·team, archived badge)
with a search field, a show-archived toggle, and an Add-employee action, reusing the existing
employee service and debounced search.

#### Scenario: Search filters the list

- **WHEN** the user types a query
- **THEN** only matching employees are shown; a query matching nothing shows an empty state,
  not an error

#### Scenario: Open a profile

- **WHEN** the user activates an employee card
- **THEN** they navigate to that employee's consolidated profile

#### Scenario: Archived visibility

- **WHEN** the show-archived toggle is off
- **THEN** archived employees are hidden by default and shown when toggled on

### Requirement: Consolidated employee profile

The employee profile SHALL present, on a single page, a header (avatar, name, role·team,
email, links, archived badge) with Edit, Archive/Restore, New task, and Log interaction
actions; an interactions timeline with type/author filters; and portfolio projects, education,
and links — reusing existing services. The interactions and portfolio capabilities defined by
their own specs are unchanged; this requirement only governs their presentation together.

#### Scenario: Sections render together

- **WHEN** the user opens an employee with interactions and portfolio data
- **THEN** the header, interactions timeline, and portfolio sections render on one page

#### Scenario: Empty-but-present sections

- **WHEN** the user opens an employee with no activity
- **THEN** each section renders an empty state, not an error

#### Scenario: Legacy routes redirect

- **WHEN** the user navigates to `/employees/:id/interactions` or `/employees/:id/portfolio`
- **THEN** they are redirected to the consolidated `/employees/:id` profile

### Requirement: Modal-driven create/edit

Logging an interaction and adding/editing an employee SHALL be performed in native-`<dialog>`
modals rather than separate routes, reusing the existing reactive forms, validation, and
services.

#### Scenario: Log interaction

- **WHEN** the user opens the Log-interaction modal, completes a valid form, and saves
- **THEN** the interaction is created via the existing API and appears in the timeline

#### Scenario: Validation in a modal

- **WHEN** the user submits a modal form with a missing required field
- **THEN** an inline validation error is shown and nothing is saved

#### Scenario: Add or edit employee

- **WHEN** the user adds or edits an employee via the modal and saves valid details
- **THEN** the change persists via the existing API and is reflected in the list/profile
