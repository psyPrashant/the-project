## Dashboard Cleanup Design

### Audience and purpose

This change tightens the existing dashboard for HR/admin users by removing redundant cards and making the persistent "Signed in as" profile link useful.

### Page layout

The dashboard keeps the same page canvas (`mx-auto max-w-[1080px] px-10 py-8 pb-16`) and overall two-column structure. The left column loses the Quick Links and Me cards; the right column is unchanged.

```
┌─────────────────────────────────────────────────────────────┐
│  My Dashboard — Workforce overview    [+ Add Employee]     │
├─────────────────────────────────────────────────────────────┤
│  Workforce pulse tiles (4)                                  │
├────────────────────────┬────────────────────────────────────┤
│  Left column (35%)     │  Right column (65%)                │
│                        │                                    │
│  - Action needed       │  - Recent activity stream          │
│                        │  - Skill coverage snapshot         │
└────────────────────────┴────────────────────────────────────┘
```

### Removed elements

#### Quick Links card

Previously contained links to:
- My profile
- My tasks
- Skills Register
- People

These links are already available in the app shell navigation and user menu, so the card is unnecessary.

#### Me card

Previously showed the signed-in user's:
- My skills count
- My open tasks count
- My recent interactions count

This summary is redundant once the bottom-left profile link becomes functional and the app shell already exposes the same destinations.

### Updated app-shell "Signed in as" link

In the app shell's bottom-left footer:
- Current text: `Signed in as {firstName} {lastName}`
- Wrap the user name in a link that routes to `/employees/{currentUserId}`.
- Keep the same styling; add hover/focus states consistent with other shell links.
- Use `RouterLink` so it behaves like an internal navigation.

### Visual design

- Reuse existing `rounded-card`, `bg-card`, `border border-hairline`, `shadow-card`, and muted typography.
- Action Needed card may grow to use the freed vertical space in the left column.
- Maintain the 35%/65% two-column split on `lg` screens and stack on smaller screens.

### Accessibility

- Keep heading hierarchy intact after removing cards.
- Ensure the "Signed in as" link has a clear accessible name and focus ring.
- No hidden or unreachable content should remain in DOM after cards are removed.

### Out of scope

- Adding new dashboard sections or capabilities.
- Changing the behaviour of the user-menu "My Profile" item.
- Backend or API changes.
