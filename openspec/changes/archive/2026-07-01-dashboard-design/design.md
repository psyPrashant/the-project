## Dashboard Design

### Audience and purpose

The dashboard is designed for HR and admin users who manage the workforce. It is the default authenticated landing page. It answers:

- What is the current state of our people?
- Who needs attention or follow-up?
- What skills, tasks, and interactions are moving recently?
- What is happening with me as a user?

### Page layout

Reuse the existing Engage page canvas (`mx-auto max-w-[1080px] px-10 py-8 pb-16`).

```
┌─────────────────────────────────────────────────────────────┐
│  My Dashboard — Workforce overview    [+ Add Employee]     │
├─────────────────────────────────────────────────────────────┤
│  Workforce pulse tiles (4)                                  │
├────────────────────────┬────────────────────────────────────┤
│  Left column (35%)     │  Right column (65%)                │
│                        │                                    │
│  - Action needed       │  - Recent activity stream          │
│  - Quick links         │  - Skill coverage snapshot         │
│  - Me card             │                                    │
└────────────────────────┴────────────────────────────────────┘
```

### Header

- Title: **My Dashboard**.
- Subtitle: *Workforce overview for {firstName}*.
- Primary action: **Add Employee** → links to the employee creation flow.
- Secondary action: **Log interaction** → links to interaction creation.

### Workforce pulse tiles

Four compact stat tiles with large numbers and muted labels:

1. **Total employees** — count of all employees.
2. **Employees with skills** — distinct employees who have at least one skill.
3. **Open tasks** — count of tasks not marked done.
4. **Interactions this week** — interactions logged in the last 7 days.

Each tile links to the relevant module.

### Left column

#### Action needed

A prioritised list of employees/items requiring attention. Rows show avatar, name, reason, and link to the employee profile. Initial rules:

- Employees with **no skills recorded**.
- Employees with **overdue open tasks**.
- Employees with **no interactions in the last 30 days**.

Empty state: *“All caught up — no employees need attention right now.”*

#### Quick links

- My profile, My tasks, Skills Register, People.

#### Me card

Compact signed-in user summary:

- My skills count.
- My open tasks count.
- My recent interactions count.

### Right column

#### Recent activity stream

Combined feed of recent events across modules:

- New employee added.
- Skill added to an employee.
- Interaction logged.
- Task created or completed.
- Portfolio item added (optional).

Each row: icon, actor, target employee, short description, relative time.
Filter chips: All | People | Skills | Interactions | Tasks.

#### Skill coverage snapshot

Compact ranked list:

- Top skills by employee count.
- Orphaned skills with zero employees.
- Link to Skills Register.

### Visual design

- Reuse existing `rounded-card`, `bg-card`, `border border-hairline`, `shadow-card`, and muted typography.
- Avatar chips with initials and brand-derived background colours.
- No heavy charts; use stat tiles, lists, and mini bar indicators.
- Responsive: two-column on `lg`, single column on smaller screens.

### Accessibility

- Proper heading hierarchy (`h1` page title, `h2` section titles).
- Sectioned landmarks with `aria-label` on lists/tables.
- Interactive cards are links or buttons with clear focus states.
- Loading states announced with `aria-live="polite"`.

### Out of scope

- Charts, graphs, or analytics visualisations.
- Predictive metrics or risk scoring.
- RBAC beyond the current all-authenticated model.
- Manager-specific views separate from HR/admin.
- Pagination (follows D6).
