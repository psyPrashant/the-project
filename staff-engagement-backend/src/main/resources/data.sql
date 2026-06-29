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

-- ---------------------------------------------------------------------------
-- Sample interactions. Employees use IDENTITY ids, so we look them up by email
-- and guard each insert with NOT EXISTS so re-running data.sql stays idempotent.
-- ---------------------------------------------------------------------------
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: discussed goals and growth areas.', 'MEETING', DATE '2026-06-10'
FROM employees a, employees s
WHERE a.email = 'admin@psybergate.com' AND s.email = 'jane.doe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id
      AND i.note = 'Quarterly check-in: discussed goals and growth areas.'
  );

INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Called to follow up on the portfolio API integration.', 'CALL', DATE '2026-06-18'
FROM employees a, employees s
WHERE a.email = 'john.smith@psybergate.com' AND s.email = 'jane.doe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id
      AND i.note = 'Called to follow up on the portfolio API integration.'
  );

INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Completed the Spring Security spike; notes captured for the team.', 'NOTE', DATE '2026-06-20'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'jane.doe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id
      AND i.note = 'Completed the Spring Security spike; notes captured for the team.'
  );

-- ---------------------------------------------------------------------------
-- Sample portfolio data (education, projects, showcase links) for Jane & John.
-- ---------------------------------------------------------------------------
INSERT INTO portfolio_education (employee_id, institution, qualification, field_of_study, start_year, end_year, description)
SELECT e.id, 'University of Cape Town', 'BSc Computer Science', 'Software Engineering', 2014, 2017,
       'Graduated cum laude; focus on distributed systems.'
FROM employees e
WHERE e.email = 'jane.doe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM portfolio_education pe
    WHERE pe.employee_id = e.id AND pe.institution = 'University of Cape Town'
      AND pe.qualification = 'BSc Computer Science'
  );

INSERT INTO portfolio_education (employee_id, institution, qualification, field_of_study, start_year, end_year, description)
SELECT e.id, 'Stellenbosch University', 'BEng Electronic Engineering', 'Embedded Systems', 2012, 2016, NULL
FROM employees e
WHERE e.email = 'john.smith@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM portfolio_education pe
    WHERE pe.employee_id = e.id AND pe.institution = 'Stellenbosch University'
      AND pe.qualification = 'BEng Electronic Engineering'
  );

INSERT INTO portfolio_projects (employee_id, name, description, start_date, end_date, url)
SELECT e.id, 'Staff Engagement Platform', 'Internal POC for managing staff engagement.',
       DATE '2026-01-15', NULL, 'https://example.com/projects/staff-engagement'
FROM employees e
WHERE e.email = 'jane.doe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM portfolio_projects pp
    WHERE pp.employee_id = e.id AND pp.name = 'Staff Engagement Platform'
  );

INSERT INTO portfolio_projects (employee_id, name, description, start_date, end_date, url)
SELECT e.id, 'Billing Service Migration', 'Migrated the legacy billing service to Spring Boot.',
       DATE '2025-03-01', DATE '2025-09-30', 'https://example.com/projects/billing-migration'
FROM employees e
WHERE e.email = 'john.smith@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM portfolio_projects pp
    WHERE pp.employee_id = e.id AND pp.name = 'Billing Service Migration'
  );

INSERT INTO portfolio_links (employee_id, label, url, sort_order)
SELECT e.id, 'GitHub', 'https://github.com/janedoe', 1
FROM employees e
WHERE e.email = 'jane.doe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM portfolio_links pl WHERE pl.employee_id = e.id AND pl.label = 'GitHub'
  );

INSERT INTO portfolio_links (employee_id, label, url, sort_order)
SELECT e.id, 'LinkedIn', 'https://www.linkedin.com/in/janedoe', 2
FROM employees e
WHERE e.email = 'jane.doe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM portfolio_links pl WHERE pl.employee_id = e.id AND pl.label = 'LinkedIn'
  );

INSERT INTO portfolio_links (employee_id, label, url, sort_order)
SELECT e.id, 'GitHub', 'https://github.com/johnsmith', 1
FROM employees e
WHERE e.email = 'john.smith@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM portfolio_links pl WHERE pl.employee_id = e.id AND pl.label = 'GitHub'
  );