# Dashboard Cleanup

## User Story

As an authenticated HR/admin user, I want the dashboard to show only meaningful workforce information and I want the persistent "Signed in as" link to take me to my profile, so that the screen is not cluttered with redundant navigation and the profile link is useful.

## Acceptance Criteria

### Remove Quick Links card

- The dashboard must no longer render a card titled **Quick Links**.
- Links previously shown in Quick Links (My profile, My tasks, Skills Register, People) must remain reachable through the app shell.

### Remove Me card

- The dashboard must no longer render a card titled **Me** or containing personal skill/task/interaction counts.

### Signed in as link

- The app-shell footer text **Signed in as {firstName} {lastName}** must be a clickable link.
- Clicking the link must navigate to the current signed-in user's profile page (`/employees/{currentUserId}`).
- The behaviour must be identical to selecting **My Profile** from the user menu.

### Layout

- The dashboard must display Workforce Pulse, Action Needed, Recent Activity, and Skill Coverage without requiring vertical page scrolling on a standard desktop viewport.

### Tests

- `dashboard.spec.ts` must not contain tests for the removed cards.
- `e2e/dashboard.spec.ts` must not fail due to missing removed-card locators.
- Shell/component tests must verify the "Signed in as" link routes to the current user's profile.

## API Changes

None.

## UI/UX Notes

- Use existing shell link styling for the "Signed in as" link.
- Preserve avatar display and signed-in user details in the shell footer.

## Out of Scope

- Adding new dashboard sections.
- Changing the user-menu "My Profile" item.
- Any backend changes.
