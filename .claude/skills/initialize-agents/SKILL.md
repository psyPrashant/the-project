---
name: initialize-agents
description: Initialize personal agents from AGENTS.md into .claude/myagents/ so they can be invoked without storing them in the default .claude/agents/ folder.
license: MIT
metadata:
  author: project
  version: "1.0"
---

Read the agent definitions in `AGENTS.md` and generate corresponding Claude Code agent files under `.claude/myagents/`.

## When to use

Use when the user wants to sync agents defined in `AGENTS.md` into the local `.claude/myagents/` folder so they can be referenced or invoked for this project.

## Steps

1. **Read `AGENTS.md`**

   If the file does not exist, tell the user and stop.

2. **Parse agent definitions**

   Each agent is introduced by a top-level heading like `## <Agent Name> Agent` (e.g. `## Task Agent`, `## Backend Agent`).
   Extract for each agent:
   - Name (from the heading)
   - Responsibility
   - Rules
   - Forbidden items
   - Typical tasks
   - Any other relevant sections

3. **Sanitize secrets**

   Strip any API tokens, passwords, or other credentials found in the source text. Do not copy them into the generated agent files. If an agent needs a token, note that it should be supplied via environment variables or a secure secret store.

4. **Write one agent file per agent**

   Create files under `.claude/myagents/` using the kebab-cased agent name, e.g.:

   - `.claude/myagents/task-agent.md`
   - `.claude/myagents/backend-agent.md`
   - `.claude/myagents/frontend-agent.md`
   - `.claude/myagents/database-agent.md`
   - `.claude/myagents/security-agent.md`
   - `.claude/myagents/testing-agent.md`

   Each file must follow this frontmatter format:

   ```markdown
   ---
   name: <kebab-agent-name>
   description: <one-line description>
   ---
   ```

   Then include the parsed sections as markdown body content.

5. **Ensure `.claude/myagents/` is ignored**

   If `.gitignore` does not already contain `.claude/myagents/`, add it.

6. **Report results**

   List the files created and any warnings (e.g. secrets stripped, sections skipped).

## Generated agent file format

```markdown
---
name: backend-agent
description: Senior Spring Boot 3 engineer. Handles REST APIs, business logic, validation, database integration, and security implementation.
---

# Backend Agent

## Responsibility

- Spring Boot features
- REST APIs
- Business logic
- Validation
- Database integration
- Security implementation

## Rules

- Follow Spring Boot 3 best practices
- Use transactional boundaries correctly
- Use `@Valid` on request DTOs
- Prefer service-layer validation
- Write unit tests for services
- Use Flyway for schema changes
- Use pagination for large datasets
- Align with the tech-stack of the project you are working on

## Forbidden

- No business logic in controllers
- No native SQL unless approved
- No direct entity exposure
- No hardcoded credentials

## Typical Tasks

- Create REST endpoints
- Add service methods
- Create Flyway migrations
- Implement JWT authentication
- Optimize queries
```
