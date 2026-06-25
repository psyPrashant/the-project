---
name: "OPSX: Apply"
description: Implement tasks from an OpenSpec change (Experimental)
category: Workflow
tags: [workflow, artifacts, experimental]
---

Implement tasks from an OpenSpec change.

**Input**: Optionally specify a change name (e.g., `/opsx:apply add-auth`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run `openspec list --json` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., `/opsx:apply <other>`).

2. **Check status to understand the schema**
   ```bash
   openspec status --change "<name>" --json
   ```
   Parse the JSON to understand:
   - `schemaName`: The workflow being used (e.g., "spec-driven")
   - Which artifact contains the tasks (typically "tasks" for spec-driven, check status for others)

3. **Get apply instructions**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   This returns:
   - `contextFiles`: artifact ID -> array of concrete file paths (varies by schema)
   - Progress (total, complete, remaining)
   - Task list with status
   - Dynamic instruction based on current state

   **Handle states:**
   - If `state: "blocked"` (missing artifacts): show message, suggest using `/opsx:continue`
   - If `state: "all_done"`: congratulate, suggest archive
   - Otherwise: proceed to implementation

4. **Read context files**

   Read every file path listed under `contextFiles` from the apply instructions output.
   The files depend on the schema being used:
   - **spec-driven**: proposal, specs, design, tasks
   - Other schemas: follow the contextFiles from CLI output

5. **Show current progress**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - Remaining tasks overview
   - Dynamic instruction from CLI

6. **BDD — Write the feature file BEFORE implementation**

   Before writing any production code, derive a Gherkin `.feature` file from the
   change's proposal and specs. This is the acceptance contract — the code must
   make these scenarios pass.

   **6a. Read the change's proposal and specs** to understand the acceptance criteria.

   **6b. Write the feature file** to two locations:

   ```
   openspec/changes/<change-name>/specs/<module>.feature    ← source of truth
   staff-engagement-backend/src/test/resources/features/<module>.feature  ← Cucumber runtime
   ```

   Derive the module name from the change content (e.g., a change about employees
   → `employee.feature`). If the change spans multiple modules, create one
   `.feature` per module.

   **6c. Feature file rules:**
   - Tag with the module name: `@employee`, `@task`, etc.
   - Include the change name in the Feature description for traceability
   - Write scenarios for every acceptance criterion — both happy and negative paths
   - Use reusable step phrasing (see CommonSteps pattern below) so steps can
     be shared across modules:
     - `When I send a POST to "<path>" with body:` — generic HTTP step
     - `Then the response status should be {int}` — generic assertion
     - `Given an employee exists with email "<email>"` — module-specific setup

   **6d. Show the feature file** to the user:

   ```
   ## BDD Contract — <change-name>

   Created `<module>.feature` with N scenarios:
   - Scenario: <name>
   - Scenario: <name>
   - ...

   These scenarios define the acceptance criteria. Implementation begins now.
   ```

   **Skip this step if:**
   - A `.feature` file for this change already exists (resuming a partial apply)
   - The change is infrastructure/tooling-only with no API behavior to test

7. **Implement tasks (loop until done or blocked)**

   For each pending task:
   - Show which task is being worked on
   - Make the code changes required
   - Keep changes minimal and focused
   - Mark task complete in the tasks file: `- [ ]` → `- [x]`
   - Continue to next task

   **Pause if:**
   - Task is unclear → ask for clarification
   - Implementation reveals a design issue → suggest updating artifacts
   - Error or blocker encountered → report and wait for guidance
   - User interrupts

8. **BDD — Generate step definitions AFTER implementation**

   After all tasks are complete (or when paused with production code written),
   generate the Cucumber step definitions so the feature file is executable.

   **8a. Check if Cucumber dependencies exist** in `pom.xml`:

   ```bash
   grep -q "cucumber" staff-engagement-backend/pom.xml && echo "OK" || echo "NEED SETUP"
   ```

   If missing, add the Cucumber dependencies, runner (`CucumberIT.java`), and
   Spring config (`CucumberSpringConfig.java`). See the `cucumber-test` agent
   for the exact setup.

   **8b. Read the feature file(s)** created in step 6.

   **8c. Check for existing step definitions:**

   ```bash
   find staff-engagement-backend/src/test/java -path "*/bdd/steps/*.java" 2>/dev/null
   ```

   **8d. Generate missing step definitions:**

   - `CommonSteps.java` — reusable HTTP and assertion steps (if it doesn't exist):
     - `When I send a POST/GET/PUT/DELETE to {string} ...`
     - `Then the response status should be {int}`
     - `And the response body should contain {string} = {string}`
   - `<Module>Steps.java` — module-specific setup steps:
     - `Given an employee exists with email {string}`
     - `Given a task exists for employee {string}`
     - etc.

   Step definitions go in:
   `staff-engagement-backend/src/test/java/com/psybergate/staff_engagement/bdd/steps/`

   **8e. Do NOT run Cucumber.** The developer will run it manually after review.

9. **On completion or pause, show status**

   Display:
   - Tasks completed this session
   - Overall progress: "N/M tasks complete"
   - Feature file location and scenario count
   - Step definitions generated
   - Reminder: "Run Cucumber manually when ready: `cd staff-engagement-backend && ./mvnw -B -ntp failsafe:integration-test -Dtest=CucumberIT`"
   - If all done: suggest archive
   - If paused: explain why and wait for guidance

**Output — BDD Contract Created (step 6)**

```
## BDD Contract — <change-name>

**Feature file:** openspec/changes/<change-name>/specs/<module>.feature
**Copied to:** staff-engagement-backend/src/test/resources/features/<module>.feature

### Scenarios (N total)
- Scenario: <name> — <one-line description>
- Scenario: <name> — <one-line description>
- ...

These define the acceptance criteria. Implementation begins now.
```

**Output During Implementation (step 7)**

```
## Implementing: <change-name> (schema: <schema-name>)

Working on task 3/7: <task description>
[...implementation happening...]
✓ Task complete

Working on task 4/7: <task description>
[...implementation happening...]
✓ Task complete
```

**Output On Completion (step 9)**

```
## Implementation Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Tasks:** 7/7 complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

### BDD Artifacts Generated
- **Feature file:** `openspec/changes/<name>/specs/<module>.feature` (N scenarios)
- **Copied to:** `src/test/resources/features/<module>.feature`
- **Step definitions:**
  - `CommonSteps.java` — N reusable steps
  - `<Module>Steps.java` — M module-specific steps

### Run Cucumber
```bash
cd staff-engagement-backend && ./mvnw -B -ntp failsafe:integration-test -Dtest=CucumberIT
```

All tasks complete! You can archive this change with `/opsx:archive`.
```

**Output On Pause (Issue Encountered)**

```
## Implementation Paused

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
```

**Guardrails**
- Always write the `.feature` file BEFORE any production code (step 6) — the feature file is the contract
- Always generate step definitions AFTER implementation is complete (step 8)
- Feature files go to BOTH `openspec/changes/<name>/specs/` AND `src/test/resources/features/`
- Step definitions go in `src/test/java/com/psybergate/staff_engagement/bdd/steps/`
- Skip BDD steps only for infrastructure/tooling changes with no API behavior
- If resuming a partial apply that already has a feature file, skip step 6
- Keep going through tasks until done or blocked
- Always read context files before starting (from the apply instructions output)
- If task is ambiguous, pause and ask before implementing
- If implementation reveals issues, pause and suggest artifact updates
- Keep code changes minimal and scoped to each task
- Update task checkbox immediately after completing each task
- Pause on errors, blockers, or unclear requirements - don't guess
- Use contextFiles from CLI output, don't assume specific file names

**Fluid Workflow Integration**

This skill supports the "actions on a change" model:

- **Can be invoked anytime**: Before all artifacts are done (if tasks exist), after partial implementation, interleaved with other actions
- **Allows artifact updates**: If implementation reveals design issues, suggest updating artifacts - not phase-locked, work fluidly
