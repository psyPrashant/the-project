## Why

The Skills Register page currently presents two competing ways to choose a skill: a top-of-page "Select a skill" `<select>` dropdown and a scrollable "All Skills" list directly below it where every skill is already a selectable button. The duplicate controls create visual clutter and confuse the mental model — users can either use the dropdown or the list, but the list is the primary browse affordance. This change removes the dropdown and replaces it with a single "All Skills" button that resets any active skill selection, leaving the existing scrollable skill list untouched.

## What Changes

- Remove the "Select a skill" `<label>` and `<select>` dropdown from `SkillsRegisterComponent`.
- Add an "All Skills" button in the same left-column position.
- Clicking the "All Skills" button clears the current skill selection and returns the right-hand results panel to its default empty state.
- Keep the existing scrollable list titled "All Skills" exactly as-is (same markup, styling, behaviour, and accessibility attributes).
- Update component and e2e tests to reference the new button instead of the removed dropdown.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `skill-search` (TSP-XX): the skill-selection affordance on the Skills Register page is simplified from a dropdown + list combination to a single reset button plus the unchanged skill list.

## Impact

**Frontend**
- `staff-engagement-frontend/src/app/skills/skills-register/skills-register.html`: remove `<label>` and `<select>`; add "All Skills" reset button.
- `staff-engagement-frontend/src/app/skills/skills-register/skills-register.ts`: add `clearSelection()` helper; remove `searchControl` value binding to the dropdown if any duplicate wiring remains.
- `staff-engagement-frontend/src/app/skills/skills-register/skills-register.spec.ts`: update unit tests that asserted on the dropdown.
- `staff-engagement-frontend/e2e/skills.spec.ts`: replace dropdown-based e2e assertions with the new "All Skills" button.

**Backend**
- None.

**API**
- None.

**Dependencies**
- None.
