## 1. OpenSpec change scaffolding

- [x] 1.1 Create change directory `openspec/changes/2026-06-29-tsp-44-frontend-reskin/`
- [x] 1.2 Write `.openspec.yaml`, `proposal.md`, `design.md`, `tasks.md`
- [x] 1.3 Write `specs/frontend-design-system/spec.md`

## 2. Design tokens and shared helpers

- [x] 2.1 Add `@theme` token block to `src/styles.css` (palette, radii, shadows)
- [x] 2.2 Create `src/app/shared/avatar.ts` (`avatarColor`, `initials`)
- [x] 2.3 Create `src/app/shared/interaction-type.ts` (type → badge style, tolerant of unknown)
- [x] 2.4 Unit specs for the shared helpers

## 3. App shell, placeholders, routing

- [x] 3.1 Create `shell/app-shell` (sidebar nav + current-user/sign-out footer)
- [x] 3.2 Create `shell/coming-soon` placeholder component
- [x] 3.3 Rewire `app.routes.ts`: shell layout route, `/dashboard` `/people` `/skills` `/tasks`,
      default redirect to `/people`, legacy redirects, retire `/home`
- [x] 3.4 Specs for `app-shell` (active nav, sign out) and `coming-soon`

## 4. Shared modal wrapper

- [x] 4.1 Create `shell/modal` (native `<dialog>`, header/body/footer, backdrop+Escape close)
- [x] 4.2 Spec for the modal (open/close, primary action, focus)

## 5. Login + People re-skin

- [x] 5.1 Restyle `auth/login` to the concept (logic unchanged)
- [x] 5.2 Convert `employees/employee-list` table → card list (search; archived toggle dropped —
      backend list returns active employees only, so no client-side toggle is possible)
- [x] 5.3 Wire Add-employee modal from People
- [x] 5.4 Update `employee-list` spec for the card structure

## 6. Consolidated profile

- [x] 6.1 Build consolidated `employees/employee-profile` (header + actions, two-column body)
- [x] 6.2 Fold interaction timeline (with type/author filters) into the profile
- [x] 6.3 Reuse + restyle portfolio project/education/link sections in the profile
- [x] 6.4 Render coming-soon for Tasks and Skills sections; New-task action shows coming-soon
- [x] 6.5 Wire Log-interaction and Edit-employee modals from the profile
- [x] 6.6 Update profile/timeline/portfolio component specs

## 7. Verification

- [x] 7.1 `npm run build -- --configuration production` clean
- [x] 7.2 `npm test -- --watch=false` (Vitest) green — 84 tests pass
- [x] 7.3 Update Playwright e2e (`app`, `interaction`, `portfolio`) + add shell-nav/placeholder
      smoke. Run deferred to CI: a non-project Postgres occupies port 5432 locally with different
      credentials, so the backend/seed can't start here. CI stands up its own Postgres.
- [ ] 7.4 Manual run against backend (blocked locally by the same Postgres port conflict — deferred to CI)
- [x] 7.5 Committed as `feat(frontend): TSP-44 reskin with Engage design system shell`
