## ADDED Requirements

### Requirement: Replace "Select a skill" dropdown with an "All Skills" button

The Skills Register page SHALL remove the "Select a skill" label and dropdown. In their place, the page SHALL display a button labelled "All Skills". Clicking the button SHALL clear any active skill selection and return the right-hand results panel to its default empty state.

#### Scenario: Dropdown is removed

- **WHEN** a user navigates to `/skills`
- **THEN** the page no longer contains a `<select>` element labelled "Select a skill"
- **AND** an "All Skills" button is visible in the left column

#### Scenario: Button clears active selection

- **GIVEN** the user has selected a skill and the results panel shows "Who's strong on {skill}?"
- **WHEN** the user clicks the "All Skills" button
- **THEN** the active skill selection is cleared
- **AND** the results panel reverts to the prompt "Select a skill to see who's strong on it."

#### Scenario: Skill list remains unchanged

- **WHEN** a user navigates to `/skills`
- **THEN** the scrollable list titled "All Skills" is still present below the new button
- **AND** the list still contains a button for every canonical skill
- **AND** clicking a skill in the list still shows its ranked results

#### Scenario: Empty register state is unchanged

- **GIVEN** the skill register contains no skills
- **WHEN** a user navigates to `/skills`
- **THEN** the "All Skills" button is still visible
- **AND** the message "No skills recorded yet." is still shown

## REMOVED Requirements

- The requirement that the Skills Register page exposes a "Select a skill" dropdown is removed.

## MODIFIED Requirements

None.
