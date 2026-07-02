## Why

The current "My Dashboard" view includes a **Quick Links** card and a **Me** card. These cards duplicate navigation that already exists in the app shell and consume vertical space in the left-hand column. Removing them simplifies the dashboard, reduces clutter, and gives the remaining content (Action Needed) more breathing room.

The app shell already has a bottom-left **"Signed in as"** link, but it currently does not navigate anywhere useful. Repurposing it to open the current user's profile (same behaviour as **My Profile** in the user menu) makes the link consistent and useful without adding new UI elements.

## What Changes

- Remove the **Quick Links** card from `DashboardComponent`.
- Remove the **Me** card from `DashboardComponent`.
- Update the app-shell **"Signed in as [Name]"** link so it navigates to the current user's profile page.
- Ensure the dashboard still fits within the viewport without vertical page scrolling after the cards are removed.
- Update dashboard unit and e2e tests to remove assertions for the deleted cards and verify that the remaining sections still render.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `dashboard-navigation`: Quick Links and Me cards are no longer part of the dashboard.
- `signed-in-as-link`: Clicking the bottom-left "Signed in as" link opens the signed-in user's profile, identical to the "My Profile" menu item.

## Impact

**Frontend**
- `staff-engagement-frontend/src/app/dashboard/dashboard.ts` + `.html`: remove Quick Links and Me card markup and helper state.
- `staff-engagement-frontend/src/app/shell/app-shell/app-shell.ts` + `.html`: make the "Signed in as" link navigate to `/employees/:currentUserId`.
- `staff-engagement-frontend/src/app/dashboard/dashboard.spec.ts`: remove card-related tests and add/update checks for the new layout.
- `staff-engagement-frontend/e2e/dashboard.spec.ts`: update locators if any assertions previously targeted the removed cards.

**Backend**
- None.

**API**
- None.

**Dependencies**
- None.
