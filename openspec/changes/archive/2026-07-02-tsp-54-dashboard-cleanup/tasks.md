## TSP-54 Dashboard Cleanup Tasks

1. **Remove Quick Links card**
   - Delete the Quick Links section from `dashboard.html`.
   - Remove any Quick Links helper methods or state from `dashboard.ts`.
   - Remove related unit-test assertions in `dashboard.spec.ts`.

2. **Remove Me card**
   - Delete the Me card section from `dashboard.html`.
   - Remove the `me` summary model consumption if it is only used by the Me card.
   - Remove or simplify the related unit-test assertions.

3. **Update app-shell "Signed in as" link**
   - In the app-shell component, add the current user's `employeeId` to the component state.
   - Wrap the displayed user name in a `RouterLink` pointing to `/employees/{currentUserId}`.
   - Ensure it behaves identically to the user-menu "My Profile" item.

4. **Adjust dashboard layout**
   - Ensure the left column still balances the right column visually now that two cards are gone.
   - Confirm no vertical page scroll is required at typical desktop viewport sizes.

5. **Update tests**
   - `dashboard.spec.ts`: remove tests for Quick Links and Me card, keep tests for Workforce Pulse, Action Needed, Recent Activity, Skill Coverage.
   - `e2e/dashboard.spec.ts`: remove or update locators/assertions that target the removed cards.
   - Add/update shell tests to verify the "Signed in as" link navigates to the current user's profile.

6. **Verification**
   - Frontend production build passes.
   - Frontend unit tests pass.
   - Backend actuator health check passes.
