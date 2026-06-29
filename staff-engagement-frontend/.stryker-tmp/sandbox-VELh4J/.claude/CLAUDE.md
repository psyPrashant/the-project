
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility & Testability Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Semantic HTML for Playwright testability

Templates MUST use semantic HTML so that Playwright e2e tests can target elements
using accessible locators (`getByRole`, `getByLabel`, `getByText`) instead of
brittle CSS selectors. These rules are mandatory for every component:

- **Buttons** — use `<button>` with visible text, never a styled `<div>` with a click handler
- **Links** — use `<a>` with `routerLink`, not `<span (click)="navigate()">`
- **Form controls** — every `<input>`, `<select>`, `<textarea>` MUST have an associated `<label>` with a matching `for`/`id` pair
- **Headings** — use `<h1>`–`<h6>` for page and section titles, in correct order
- **Lists** — use `<ul>`/`<ol>` + `<li>` for repeated items, not repeated `<div>`s
- **Tables** — use `<table>`, `<thead>`, `<tbody>`, `<th>` for tabular data, not grid `<div>`s
- **Dialogs** — use the native `<dialog>` element or an element with `role="dialog"` and `aria-label`
- **Icons** — decorative icons need `aria-hidden="true"`; interactive icons need `aria-label`
- **Loading states** — use `aria-busy="true"` on the container
- **Error messages** — use `aria-live="polite"` and associate with the control via `aria-describedby`

Use `data-testid` only as a last resort when no accessible locator can identify the element.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Playwright E2E Tests

When implementing a new user-facing feature, you MUST write a Playwright e2e test
alongside the component code. The test validates the feature works end-to-end in a
real browser against the live backend.

### Where tests go

- Test files: `e2e/<module>.spec.ts` (e.g., `e2e/employee.spec.ts`)
- One file per domain module — append new `test()` blocks to an existing file if one exists for the module

### How to write tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Employee management', () => {
  test('create a new employee', async ({ page }) => {
    await page.goto('/employees');
    await page.getByRole('button', { name: 'Add Employee' }).click();
    await page.getByLabel('First Name').fill('Sipho');
    await page.getByLabel('Last Name').fill('Ndlovu');
    await page.getByLabel('Email').fill('sipho@example.com');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Sipho Ndlovu')).toBeVisible();
  });
});
```

### Rules

- Use accessible locators: `getByRole()`, `getByLabel()`, `getByText()`, `getByPlaceholder()`
- Use `data-testid` only when no accessible locator can identify the element
- Each test must be independent — no ordering dependencies between tests
- Test both the happy path and at least one negative/validation path per feature
- Do NOT import or call services directly — tests interact through the browser only
