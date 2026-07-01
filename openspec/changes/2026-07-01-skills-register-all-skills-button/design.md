## Context

Epic 5 delivered the Skills Register at `/skills`. The left column renders a `<select>` dropdown labelled "Select a skill" followed immediately by a scrollable list titled "All skills" that contains one button per canonical skill. Both controls write to the same reactive `searchControl`, so the dropdown is functionally redundant. User feedback asks for the dropdown to be replaced by an "All Skills" button and for the existing skill list below to remain unchanged.

## Goals / Non-Goals

**Goals:**
- Remove the redundant "Select a skill" dropdown from the Skills Register page.
- Provide a single, clearly labelled "All Skills" button that resets the current selection.
- Leave the existing scrollable "All Skills" skill list (markup, styling, click behaviour, empty state, accessibility) untouched.
- Keep all existing search/sort behaviour in the right-hand results panel unchanged.
- Update tests to match the new UI.

**Non-Goals:**
- No change to the `/api/skills` or `/api/skills/search` endpoints.
- No change to the skill list's scrollable box or its contents.
- No change to the ranked-results table, sort buttons, or empty-result messages.
- No new backend migrations or seed data changes.

## Decisions

### D-SK-UI-1 — Replace dropdown with a reset button, not another select

The new control is a button labelled "All Skills". Clicking it sets `searchControl` to `''`, which clears `searchResults` and re-renders the default prompt in the right panel. This is the simplest replacement that preserves the current signal/reactive flow and avoids introducing new state.

**Alternative considered:** Convert the dropdown into a searchable autocomplete. Rejected — the user explicitly requested an "All Skills" button and the existing scrollable list already provides full browseability.

### D-SK-UI-2 — Keep the scrollable skill list unchanged

The existing `<ul aria-label="All skills">` and its per-skill buttons remain exactly as implemented in Epic 5. This satisfies the requirement "The list below labelled 'All Skills' lists all the skills and should remain the same. no changes."

### D-SK-UI-3 — Button state mirrors current selection

The "All Skills" button is visually distinct when no skill is selected (i.e., `searchControl.value === ''`) and reverts to a neutral style when a specific skill is active. This gives users immediate feedback on the current mode without adding extra state.

## Risks / Trade-offs

- **[Risk] Users may expect the button to show all employees across every skill.** The label "All Skills" could be misread as "show everything". Mitigation: keep the right panel's default empty prompt, and consider a tooltip or aria-label such as "Clear skill selection and show all skills" if usability testing shows confusion.
- **[Risk] E2E tests break.** `skills.spec.ts` currently uses `page.getByLabel('Select a skill')`. Mitigation: update those selectors to target the new button and add an explicit clear-selection scenario.

## Migration Plan

1. Edit the Skills Register component HTML and TypeScript.
2. Update Vitest component tests and Playwright e2e spec.
3. Run `npm run test` and `npx playwright test e2e/skills.spec.ts` locally.
4. No backend or database steps are required.

## Open Questions

None.
