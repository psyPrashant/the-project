## 1. Frontend — Remove dropdown and add "All Skills" button

- [x] 1.1 In `skills-register.html`, remove the `<label for="skillSearch">Select a skill</label>` element and the `<select id="skillSearch">` element.
- [x] 1.2 In `skills-register.html`, add an "All Skills" button above the existing scrollable skill list. Button text must read exactly "All Skills".
- [x] 1.3 Wire the button's `(click)` event to a new `clearSelection()` method in `skills-register.ts` that sets `searchControl.setValue('')`.
- [x] 1.4 Style the button consistently with existing app shell buttons (e.g., rounded, brand/bg-page colours) and give it an `aria-pressed="true"` state when `searchControl.value === ''`.
- [x] 1.5 Ensure the existing scrollable "All Skills" list and its per-skill buttons are left untouched.
- [x] 1.6 Verify the right panel still shows the default prompt when no skill is selected and ranked results when a skill is selected.

## 2. Frontend — Update component tests

- [x] 2.1 In `skills-register.spec.ts`, remove any assertions that query the removed `<select>` or the "Select a skill" label.
- [x] 2.2 Add a test asserting that the "All Skills" button is rendered on initial load.
- [x] 2.3 Add a test asserting that clicking the "All Skills" button clears a previously selected skill and returns the results panel to the empty prompt.
- [x] 2.4 Add a test asserting that the scrollable skill list still renders all skills and that selecting a skill from the list still triggers a search.
- [ ] 2.5 Run `npm run test -- --run` and confirm all Vitest tests pass.

## 3. E2E — Update Playwright spec

- [x] 3.1 In `e2e/skills.spec.ts`, replace `page.getByLabel('Select a skill')` selectors with the new "All Skills" button (`page.getByRole('button', { name: 'All Skills' })`).
- [x] 3.2 Update the test that selects Java via the dropdown so it instead clicks "Java" inside the scrollable "All Skills" list.
- [x] 3.3 Update the test that clears search by selecting the default dropdown option so it instead clicks the "All Skills" button.
- [ ] 3.4 Run `npx playwright test e2e/skills.spec.ts` and confirm all e2e scenarios pass.

## 4. Verification & Handoff

- [ ] 4.1 Run the full frontend test suite: `npm run test`.
- [ ] 4.2 Run the e2e suite: `npx playwright test`.
- [ ] 4.3 Commit with a conventional message referencing the Skills Register UI change.
- [ ] 4.4 Move the OpenSpec change to `openspec/changes/archive/` once the PR is merged.
