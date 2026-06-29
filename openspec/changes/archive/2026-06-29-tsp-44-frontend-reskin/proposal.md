## Why

The frontend works but is a plain, table-first Tailwind UI with no global layout — each
page styles itself and features live on separate routes. The team produced a Claude Design
concept ("Engage") with a unified sidebar shell, a card-based visual language, modal-driven
create/edit flows, and a consolidated employee profile. This change adopts that look and
navigation across the existing, API-backed screens.

Only `auth`, `employee`, `interaction`, and `portfolio` exist in the backend. The concept's
Dashboard, My Tasks, and Skills Register screens (backlog Epics 3 & 5) have no backend yet,
so they are delivered as honest "coming soon" placeholders rather than mocked data.

This is a **frontend-only** change. No backend, database, or API changes.

## What Changes

- Add design tokens to `styles.css` via a Tailwind 4 `@theme` block (brand `#3b5bdb`,
  neutral surfaces, card radii/shadows) and shared TS helpers for deterministic avatar
  colours and interaction-type badge styling.
- Add an authenticated **app shell** (`shell/app-shell`) with a fixed sidebar: logo, nav
  (My Dashboard, People, Skills Register, My Tasks) with router-driven active state, and a
  "Signed in as" footer showing the real current user plus Sign out. The prototype's
  user-switcher is intentionally replaced by the resolved current user (D3).
- Add a reusable `shell/coming-soon` placeholder and a native-`<dialog>` `shell/modal`
  wrapper.
- Rewire `app.routes.ts` so authenticated routes are children of the shell; add `/dashboard`,
  `/skills`, `/tasks` placeholder routes; default authenticated redirect to `/people`; retire
  `/home`; fold `/employees/:id/interactions` and `/employees/:id/portfolio` into a single
  consolidated `/employees/:id` profile (old paths redirect).
- Re-skin **Login** and convert **People** from a table to a card list (avatar, role·team,
  counts, archived badge, search, show-archived toggle, Add-employee modal).
- Consolidate the **employee profile** into one page: header with actions (Edit, Archive/
  Restore, New task [coming soon], Log interaction), interactions timeline with type/author
  filters (reused), and portfolio projects/education/links (reused). Tasks and Skills
  sections render the coming-soon placeholder.
- Convert Log-interaction and Add/Edit-employee flows from routes to modals (reusing existing
  services and reactive forms).
- Update Vitest component specs and Playwright e2e for the new structure; add smoke coverage
  for shell navigation and each placeholder.

## Capabilities

### New Capabilities
- `frontend-design-system`: a unified app shell, design tokens, re-skinned People/Profile/
  Login screens, modal-driven create/edit, and "coming soon" placeholders for not-yet-built
  screens. Covers Jira ticket TSP-44.

## Impact

- **Frontend only**: new `shell/` and `shared/` code; restyled `auth/login`,
  `employees/*`, `interactions/*`, `portfolios/*` components; `app.routes.ts` restructure;
  `styles.css` tokens; retired `home/`.
- **Tests**: updated Vitest specs and Playwright e2e (`e2e/app.spec.ts`,
  `e2e/interaction.spec.ts`, `e2e/portfolio.spec.ts`) plus new shell/placeholder smoke tests.
- **No backend, API, or database changes.** No changes to existing endpoints or contracts.
- **Routing change** (user-visible): `/home`, `/employees/:id/interactions`,
  `/employees/:id/portfolio`, `/interactions/new`, `/employees/new` no longer exist as
  standalone pages (redirected or replaced by modals).
