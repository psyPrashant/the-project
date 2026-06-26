-- Seed Employees for login (F6). Passwords are BCrypt hashes (cost 10) of "password123",
-- matching the BCryptPasswordEncoder bean. ON CONFLICT keeps the seed idempotent across
-- restarts and the reused Testcontainers container.
INSERT INTO employees (first_name, last_name, email, password_hash) VALUES
  ('Admin', 'User', 'admin@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju')
ON CONFLICT (email) DO NOTHING;

INSERT INTO employees (first_name, last_name, email, password_hash) VALUES
  ('Jane', 'Doe', 'jane.doe@psybergate.com', '$2a$10$itmEpWNyUeCYWTm6mmxGe.Tpc7/ytuRTPwNh/freOJjwUsrUt0Uge')
ON CONFLICT (email) DO NOTHING;

INSERT INTO employees (first_name, last_name, email, password_hash) VALUES
  ('John', 'Smith', 'john.smith@psybergate.com', '$2a$10$D3HhezptGwXreO7ey1GHKuxYlhZQ8cVy/p0A2pobAkBmXUG7wwEQm')
ON CONFLICT (email) DO NOTHING;

-- Backfill archived=false for any rows added before the column existed (safety net during
-- transition from Hibernate ddl-auto to Flyway; safe to run repeatedly).
UPDATE employees SET archived = false WHERE archived IS NULL;