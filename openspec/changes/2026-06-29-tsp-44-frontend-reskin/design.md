# Design — Frontend Reskin ("Engage")

## Source of truth

The concept is `design/extracted/staff-engagement-poc-prototype/project/Staff Engagement.dc.html`
(a Claude Design HTML/CSS prototype with mock in-memory data). We recreate its **visual
output**, not its internal structure, mapping each screen onto the existing Angular features
and real APIs.

## Key adaptations from prototype → real app

- **User-switcher → current user.** The prototype switches `currentUserId` across employees
  to demo personalised views. With real auth this is impersonation and is dropped; the
  sidebar footer shows `AuthService` current user + Sign out (D3).
- **Personalised screens are placeholders.** Dashboard, My Tasks, and Skills Register depend
  on `task`/`skills`/aggregation backends that do not exist (Epics 3 & 5). They render the
  `coming-soon` placeholder instead of mock data.
- **Default landing → `/people`.** A functional screen, so users are not greeted by a
  placeholder. Dashboard remains a nav item that resolves to the placeholder.
- **Per-person skill chips / counts on People cards.** Skills have no backend, so People cards
  show role·team and interaction-derived info available from existing APIs; skill chips are
  omitted (not faked).

## Design tokens (Tailwind 4, CSS-first)

Defined in `src/styles.css` under `@theme` so utilities are available app-wide. Palette from
the concept: brand `#3b5bdb` (hover `#3350c4`, tint `#eef1fd`); accents purple `#7c3aed`,
cyan `#0891b2`, green `#15803d`, amber `#b45309`, rose `#be123c`. Surfaces: page `#f7f8fa`,
card `#fff`, hairlines `#e9ebef`/`#eef0f3`. Text: `#1a1d21`, `#344054`, `#475467`, `#6b7280`,
muted `#9aa1ab`. Card radius ~13–14px; shadows `0 1px 2px rgba(16,24,40,.04)` and hover
`0 4px 14px rgba(16,24,40,.08)`. System font stack (already the default).

Shared TS helpers (no faked data):
- `shared/avatar.ts` — `avatarColor(seed)` picks a deterministic colour from a 9-entry palette
  by hashing a stable seed (employee id), and `initials(name)`.
- `shared/interaction-type.ts` — maps an interaction type to `{ label, color, bg }`, tolerant
  of unknown/new types (falls back to a neutral badge).

## Components

- `shell/app-shell` — layout: `<aside>` 250px sidebar + scrolling `<main><router-outlet/>`.
  Nav buttons use `routerLinkActive` for active state. Footer reads `AuthService.currentUser`.
- `shell/coming-soon` — `screen` input; renders an icon, the screen name, and an
  "Under construction" message. Used by placeholder routes and profile sections.
- `shell/modal` — native `<dialog>` wrapper with `title` input, projected body, and a footer
  (Cancel + a primary action via `output()`), closing on backdrop/Escape, focus-trapped.
- Restyled existing components keep their services/signals; only template/markup + classes
  change. Interaction-form and employee-form logic is reused inside modals.

## Routing

```
/login                       → LoginComponent (outside shell)
(shell)                      → AppShellComponent (authGuard)
  ''                         → redirect to 'people'
  dashboard                  → ComingSoon(screen="My Dashboard")
  people                     → EmployeeListComponent
  employees/:id              → EmployeeProfileComponent (consolidated)
  skills                     → ComingSoon(screen="Skills Register")
  tasks                      → ComingSoon(screen="My Tasks")
  home                       → redirect to 'dashboard'
  employees/:id/interactions → redirect to 'employees/:id'
  employees/:id/portfolio    → redirect to 'employees/:id'
```

Create/edit flows (`/employees/new`, `/employees/:id/edit`, `/interactions/new`,
`/interactions/:id/edit`) become modal interactions on People/Profile rather than routes.

## Conventions

Standalone components; signals + `computed()`; `OnPush`; `inject()`; `input()`/`output()`;
native `@if`/`@for`; reactive forms; **no `ngClass`/`ngStyle`** (direct `class`/`style`
bindings); native `<dialog>` for modals; semantic HTML, labelled inputs, aria-live errors
(WCAG AA / AXE), per `staff-engagement-frontend/.claude/CLAUDE.md`.

## Testing

- Vitest: update specs touching changed structure; add specs for `app-shell`, `coming-soon`,
  `modal`.
- Playwright: table→cards, route→modal, split→consolidated will break existing locators in
  `e2e/app.spec.ts`, `interaction.spec.ts`, `portfolio.spec.ts`; update to role/label locators
  and add a shell-navigation + placeholder smoke test. No new backend flows.
