---
description: Seed the database with baseline demo data (employees, interactions, tasks, portfolios). Idempotent — safe to run multiple times.
---

Seed the Staff Engagement database with baseline demo data.

Steps:
1. Check the backend is healthy by running: `curl -s http://localhost:8080/actuator/health`
2. If the backend is not running (connection refused or unhealthy), tell the user to start it first:
   ```
   cd staff-engagement-backend && ./mvnw spring-boot:run
   ```
3. POST to the seed endpoint: `curl -s -X POST http://localhost:8080/api/seed`
4. Parse the JSON response and display a summary like:

   ```
   Seed complete
   ─────────────────────────
   Employees    : N
   Interactions : N
   Tasks        : N
   Portfolios   : N
   ─────────────────────────
   Re-running is safe — seed is idempotent.
   ```

5. If the request fails, show the error and suggest checking the backend logs.
