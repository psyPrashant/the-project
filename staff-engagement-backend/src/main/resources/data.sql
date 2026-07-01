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

-- ---------------------------------------------------------------------------
-- Canonical skills (task 8.1). Unique by LOWER(name) via functional index;
-- NOT EXISTS guard keeps re-runs idempotent.
-- ---------------------------------------------------------------------------
INSERT INTO skill (name) SELECT 'Angular'     WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'angular');
INSERT INTO skill (name) SELECT 'Java'        WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'java');
INSERT INTO skill (name) SELECT 'Spring Boot' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'spring boot');
INSERT INTO skill (name) SELECT 'SQL'         WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'sql');
INSERT INTO skill (name) SELECT 'TypeScript'  WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'typescript');
INSERT INTO skill (name) SELECT 'Docker'      WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'docker');

-- ---------------------------------------------------------------------------
-- Employee–skill links with varied years (task 8.2). Jane and John each have
-- multiple skills so that the "who's strong on X?" search returns a ranked list.
-- ---------------------------------------------------------------------------
INSERT INTO employee_skill (employee_id, skill_id, years)
SELECT e.id, s.id, 6
FROM employees e, skill s
WHERE e.email = 'jane.doe@psybergate.com' AND LOWER(s.name) = 'angular'
  AND NOT EXISTS (SELECT 1 FROM employee_skill es WHERE es.employee_id = e.id AND es.skill_id = s.id);

INSERT INTO employee_skill (employee_id, skill_id, years)
SELECT e.id, s.id, 6
FROM employees e, skill s
WHERE e.email = 'jane.doe@psybergate.com' AND LOWER(s.name) = 'typescript'
  AND NOT EXISTS (SELECT 1 FROM employee_skill es WHERE es.employee_id = e.id AND es.skill_id = s.id);

INSERT INTO employee_skill (employee_id, skill_id, years)
SELECT e.id, s.id, 4
FROM employees e, skill s
WHERE e.email = 'jane.doe@psybergate.com' AND LOWER(s.name) = 'spring boot'
  AND NOT EXISTS (SELECT 1 FROM employee_skill es WHERE es.employee_id = e.id AND es.skill_id = s.id);

INSERT INTO employee_skill (employee_id, skill_id, years)
SELECT e.id, s.id, 8
FROM employees e, skill s
WHERE e.email = 'john.smith@psybergate.com' AND LOWER(s.name) = 'java'
  AND NOT EXISTS (SELECT 1 FROM employee_skill es WHERE es.employee_id = e.id AND es.skill_id = s.id);

INSERT INTO employee_skill (employee_id, skill_id, years)
SELECT e.id, s.id, 6
FROM employees e, skill s
WHERE e.email = 'john.smith@psybergate.com' AND LOWER(s.name) = 'spring boot'
  AND NOT EXISTS (SELECT 1 FROM employee_skill es WHERE es.employee_id = e.id AND es.skill_id = s.id);

INSERT INTO employee_skill (employee_id, skill_id, years)
SELECT e.id, s.id, 3
FROM employees e, skill s
WHERE e.email = 'john.smith@psybergate.com' AND LOWER(s.name) = 'docker'
  AND NOT EXISTS (SELECT 1 FROM employee_skill es WHERE es.employee_id = e.id AND es.skill_id = s.id);

INSERT INTO employee_skill (employee_id, skill_id, years)
SELECT e.id, s.id, 5
FROM employees e, skill s
WHERE e.email = 'admin@psybergate.com' AND LOWER(s.name) = 'sql'
  AND NOT EXISTS (SELECT 1 FROM employee_skill es WHERE es.employee_id = e.id AND es.skill_id = s.id);

INSERT INTO employee_skill (employee_id, skill_id, years)
SELECT e.id, s.id, 2
FROM employees e, skill s
WHERE e.email = 'admin@psybergate.com' AND LOWER(s.name) = 'docker'
  AND NOT EXISTS (SELECT 1 FROM employee_skill es WHERE es.employee_id = e.id AND es.skill_id = s.id);

-- ---------------------------------------------------------------------------
-- Link skills to portfolio projects (task 8.3). Gives non-zero projectCount
-- values so the ranked search returns meaningful results.
-- ---------------------------------------------------------------------------
-- Jane: Angular → Staff Engagement Platform
INSERT INTO employee_skill_project (employee_skill_id, project_id)
SELECT es.id, pp.id
FROM employee_skill es
JOIN skill s ON es.skill_id = s.id
JOIN employees e ON es.employee_id = e.id
JOIN portfolio_projects pp ON pp.employee_id = e.id
WHERE e.email = 'jane.doe@psybergate.com'
  AND LOWER(s.name) = 'angular'
  AND pp.name = 'Staff Engagement Platform'
  AND NOT EXISTS (
    SELECT 1 FROM employee_skill_project esp
    WHERE esp.employee_skill_id = es.id AND esp.project_id = pp.id
  );

-- Jane: Spring Boot → Staff Engagement Platform
INSERT INTO employee_skill_project (employee_skill_id, project_id)
SELECT es.id, pp.id
FROM employee_skill es
JOIN skill s ON es.skill_id = s.id
JOIN employees e ON es.employee_id = e.id
JOIN portfolio_projects pp ON pp.employee_id = e.id
WHERE e.email = 'jane.doe@psybergate.com'
  AND LOWER(s.name) = 'spring boot'
  AND pp.name = 'Staff Engagement Platform'
  AND NOT EXISTS (
    SELECT 1 FROM employee_skill_project esp
    WHERE esp.employee_skill_id = es.id AND esp.project_id = pp.id
  );

-- John: Java → Billing Service Migration
INSERT INTO employee_skill_project (employee_skill_id, project_id)
SELECT es.id, pp.id
FROM employee_skill es
JOIN skill s ON es.skill_id = s.id
JOIN employees e ON es.employee_id = e.id
JOIN portfolio_projects pp ON pp.employee_id = e.id
WHERE e.email = 'john.smith@psybergate.com'
  AND LOWER(s.name) = 'java'
  AND pp.name = 'Billing Service Migration'
  AND NOT EXISTS (
    SELECT 1 FROM employee_skill_project esp
    WHERE esp.employee_skill_id = es.id AND esp.project_id = pp.id
  );

-- John: Spring Boot → Billing Service Migration
INSERT INTO employee_skill_project (employee_skill_id, project_id)
SELECT es.id, pp.id
FROM employee_skill es
JOIN skill s ON es.skill_id = s.id
JOIN employees e ON es.employee_id = e.id
JOIN portfolio_projects pp ON pp.employee_id = e.id
WHERE e.email = 'john.smith@psybergate.com'
  AND LOWER(s.name) = 'spring boot'
  AND pp.name = 'Billing Service Migration'
  AND NOT EXISTS (
    SELECT 1 FROM employee_skill_project esp
    WHERE esp.employee_skill_id = es.id AND esp.project_id = pp.id
  );

-- ---------------------------------------------------------------------------
-- Bulk demo roster (50 employees). Same password ("password123") as the
-- original three seed users, reusing admin's bcrypt hash. ON CONFLICT keeps
-- this idempotent across restarts and the reused Testcontainers container.
-- ---------------------------------------------------------------------------
INSERT INTO employees (first_name, last_name, email, password_hash, job_title, department, phone, archived) VALUES
  ('Thabo', 'Mokoena', 'thabo.mokoena@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Backend Engineer', 'Engineering', '+27 82 101 2001', false),
  ('Amanda', 'Pillay', 'amanda.pillay@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Frontend Engineer', 'Engineering', '+27 83 101 2002', false),
  ('Sipho', 'Dlamini', 'sipho.dlamini@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'DevOps Engineer', 'Platform', '+27 84 101 2003', false),
  ('Nomvula', 'Khumalo', 'nomvula.khumalo@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'QA Engineer', 'Engineering', '+27 82 101 2004', false),
  ('Werner', 'Botha', 'werner.botha@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Engineering Manager', 'Engineering', '+27 83 101 2005', false),
  ('Farah', 'Ismail', 'farah.ismail@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Product Manager', 'Product', '+27 84 101 2006', false),
  ('Liam', 'O''Connor', 'liam.oconnor@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'UX Designer', 'Design', '+27 82 101 2007', false),
  ('Zanele', 'Ndlovu', 'zanele.ndlovu@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'UI Designer', 'Design', '+27 83 101 2008', false),
  ('Rajesh', 'Naidoo', 'rajesh.naidoo@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Data Analyst', 'Data', '+27 84 101 2009', false),
  ('Chloe', 'van der Merwe', 'chloe.vandermerwe@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Data Engineer', 'Data', '+27 82 101 2010', false),
  ('Mpho', 'Sithole', 'mpho.sithole@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Scrum Master', 'Engineering', '+27 83 101 2011', false),
  ('Karabo', 'Molefe', 'karabo.molefe@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Business Analyst', 'Product', '+27 84 101 2012', false),
  ('Lerato', 'Mahlangu', 'lerato.mahlangu@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'People Partner', 'People', '+27 82 101 2013', false),
  ('David', 'Chen', 'david.chen@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Recruiter', 'People', '+27 83 101 2014', false),
  ('Anele', 'Zulu', 'anele.zulu@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Finance Analyst', 'Finance', '+27 84 101 2015', false),
  ('Michael', 'Fourie', 'michael.fourie@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Sales Executive', 'Sales', '+27 82 101 2016', false),
  ('Precious', 'Nkosi', 'precious.nkosi@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Marketing Specialist', 'Marketing', '+27 83 101 2017', false),
  ('Thandiwe', 'Cele', 'thandiwe.cele@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Support Engineer', 'Support', '+27 84 101 2018', false),
  ('Johan', 'Pretorius', 'johan.pretorius@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Solutions Architect', 'Engineering', '+27 82 101 2019', false),
  ('Naledi', 'Mabaso', 'naledi.mabaso@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Tech Lead', 'Engineering', '+27 83 101 2020', false),
  ('Kevin', 'Govender', 'kevin.govender@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Site Reliability Engineer', 'Platform', '+27 84 101 2021', false),
  ('Bongani', 'Mthembu', 'bongani.mthembu@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Security Engineer', 'Platform', '+27 82 101 2022', true),
  ('Aisha', 'Adams', 'aisha.adams@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Backend Engineer', 'Engineering', '+27 83 101 2023', false),
  ('Pieter', 'Steyn', 'pieter.steyn@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Frontend Engineer', 'Engineering', '+27 84 101 2024', false),
  ('Zola', 'Gumede', 'zola.gumede@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Full Stack Engineer', 'Engineering', '+27 82 101 2025', false),
  ('Fatima', 'Patel', 'fatima.patel@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'QA Engineer', 'Engineering', '+27 83 101 2026', false),
  ('Ryan', 'de Beer', 'ryan.debeer@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'DevOps Engineer', 'Platform', '+27 84 101 2027', false),
  ('Nokuthula', 'Buthelezi', 'nokuthula.buthelezi@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Product Manager', 'Product', '+27 82 101 2028', false),
  ('Craig', 'Williams', 'craig.williams@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'UX Designer', 'Design', '+27 83 101 2029', false),
  ('Palesa', 'Tshabalala', 'palesa.tshabalala@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Data Analyst', 'Data', '+27 84 101 2030', false),
  ('Samuel', 'Osei', 'samuel.osei@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Data Engineer', 'Data', '+27 82 101 2031', false),
  ('Bianca', 'Marais', 'bianca.marais@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Scrum Master', 'Engineering', '+27 83 101 2032', false),
  ('Vusi', 'Radebe', 'vusi.radebe@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Business Analyst', 'Product', '+27 84 101 2033', false),
  ('Kirsten', 'Human', 'kirsten.human@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'People Partner', 'People', '+27 82 101 2034', false),
  ('Andile', 'Zwane', 'andile.zwane@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Recruiter', 'People', '+27 83 101 2035', false),
  ('Sarah', 'Abrahams', 'sarah.abrahams@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Finance Analyst', 'Finance', '+27 84 101 2036', false),
  ('Themba', 'Nxumalo', 'themba.nxumalo@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Sales Executive', 'Sales', '+27 82 101 2037', false),
  ('Emily', 'Roberts', 'emily.roberts@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Marketing Specialist', 'Marketing', '+27 83 101 2038', false),
  ('Sizwe', 'Khoza', 'sizwe.khoza@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Support Engineer', 'Support', '+27 84 101 2039', false),
  ('Deon', 'Joubert', 'deon.joubert@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Solutions Architect', 'Engineering', '+27 82 101 2040', false),
  ('Refilwe', 'Monyane', 'refilwe.monyane@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Tech Lead', 'Engineering', '+27 83 101 2041', false),
  ('Grant', 'Naicker', 'grant.naicker@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Site Reliability Engineer', 'Platform', '+27 84 101 2042', false),
  ('Nonhlanhla', 'Mkhize', 'nonhlanhla.mkhize@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Security Engineer', 'Platform', '+27 82 101 2043', false),
  ('Ahmed', 'Suleiman', 'ahmed.suleiman@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Backend Engineer', 'Engineering', '+27 83 101 2044', false),
  ('Lindiwe', 'Skosana', 'lindiwe.skosana@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Frontend Engineer', 'Engineering', '+27 84 101 2045', false),
  ('Brandon', 'Smit', 'brandon.smit@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Full Stack Engineer', 'Engineering', '+27 82 101 2046', false),
  ('Yolanda', 'Kunene', 'yolanda.kunene@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'QA Engineer', 'Engineering', '+27 83 101 2047', false),
  ('Trevor', 'Adams', 'trevor.adams@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'DevOps Engineer', 'Platform', '+27 84 101 2048', true),
  ('Puleng', 'Seleka', 'puleng.seleka@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Product Manager', 'Product', '+27 82 101 2049', false),
  ('Christopher', 'Lee', 'christopher.lee@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Intern', 'Engineering', '+27 83 101 2050', true)
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Expand the canonical skill catalog so the bulk roster's varied disciplines
-- (data, design, platform) have something to link against.
-- ---------------------------------------------------------------------------
INSERT INTO skill (name) SELECT 'React'          WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'react');
INSERT INTO skill (name) SELECT 'Python'         WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'python');
INSERT INTO skill (name) SELECT 'AWS'            WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'aws');
INSERT INTO skill (name) SELECT 'Kubernetes'     WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'kubernetes');
INSERT INTO skill (name) SELECT 'Terraform'      WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'terraform');
INSERT INTO skill (name) SELECT 'Figma'          WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'figma');
INSERT INTO skill (name) SELECT 'Agile Coaching' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'agile coaching');

-- ---------------------------------------------------------------------------
-- Employee-skill links for the bulk roster (technical/design disciplines
-- only — sales, marketing, finance, people and support roles are left
-- without entries, matching how the skills register is actually used).
-- ---------------------------------------------------------------------------
INSERT INTO employee_skill (employee_id, skill_id, years)
SELECT e.id, s.id, v.years
FROM (VALUES
  ('thabo.mokoena@psybergate.com', 'Java', 7),
  ('thabo.mokoena@psybergate.com', 'Spring Boot', 6),
  ('thabo.mokoena@psybergate.com', 'SQL', 7),
  ('amanda.pillay@psybergate.com', 'Angular', 5),
  ('amanda.pillay@psybergate.com', 'TypeScript', 5),
  ('amanda.pillay@psybergate.com', 'React', 2),
  ('sipho.dlamini@psybergate.com', 'Docker', 6),
  ('sipho.dlamini@psybergate.com', 'Kubernetes', 4),
  ('sipho.dlamini@psybergate.com', 'Terraform', 3),
  ('nomvula.khumalo@psybergate.com', 'SQL', 4),
  ('nomvula.khumalo@psybergate.com', 'Docker', 2),
  ('werner.botha@psybergate.com', 'Java', 12),
  ('werner.botha@psybergate.com', 'Angular', 6),
  ('werner.botha@psybergate.com', 'Docker', 5),
  ('liam.oconnor@psybergate.com', 'Figma', 8),
  ('zanele.ndlovu@psybergate.com', 'Figma', 4),
  ('zanele.ndlovu@psybergate.com', 'React', 3),
  ('rajesh.naidoo@psybergate.com', 'SQL', 9),
  ('rajesh.naidoo@psybergate.com', 'Python', 6),
  ('chloe.vandermerwe@psybergate.com', 'Python', 5),
  ('chloe.vandermerwe@psybergate.com', 'SQL', 6),
  ('chloe.vandermerwe@psybergate.com', 'AWS', 3),
  ('mpho.sithole@psybergate.com', 'Agile Coaching', 5),
  ('karabo.molefe@psybergate.com', 'SQL', 3),
  ('johan.pretorius@psybergate.com', 'Java', 11),
  ('johan.pretorius@psybergate.com', 'AWS', 7),
  ('johan.pretorius@psybergate.com', 'Kubernetes', 5),
  ('johan.pretorius@psybergate.com', 'Spring Boot', 9),
  ('naledi.mabaso@psybergate.com', 'Java', 8),
  ('naledi.mabaso@psybergate.com', 'Spring Boot', 7),
  ('naledi.mabaso@psybergate.com', 'Angular', 4),
  ('naledi.mabaso@psybergate.com', 'TypeScript', 4),
  ('kevin.govender@psybergate.com', 'Kubernetes', 6),
  ('kevin.govender@psybergate.com', 'AWS', 6),
  ('kevin.govender@psybergate.com', 'Terraform', 4),
  ('bongani.mthembu@psybergate.com', 'Docker', 5),
  ('bongani.mthembu@psybergate.com', 'AWS', 4),
  ('aisha.adams@psybergate.com', 'Java', 3),
  ('aisha.adams@psybergate.com', 'Spring Boot', 2),
  ('pieter.steyn@psybergate.com', 'Angular', 3),
  ('pieter.steyn@psybergate.com', 'TypeScript', 3),
  ('zola.gumede@psybergate.com', 'Angular', 4),
  ('zola.gumede@psybergate.com', 'Java', 4),
  ('zola.gumede@psybergate.com', 'Spring Boot', 3),
  ('zola.gumede@psybergate.com', 'TypeScript', 4),
  ('fatima.patel@psybergate.com', 'SQL', 5),
  ('fatima.patel@psybergate.com', 'Docker', 3),
  ('ryan.debeer@psybergate.com', 'Docker', 4),
  ('ryan.debeer@psybergate.com', 'Terraform', 2),
  ('ryan.debeer@psybergate.com', 'AWS', 3),
  ('craig.williams@psybergate.com', 'Figma', 6),
  ('palesa.tshabalala@psybergate.com', 'SQL', 3),
  ('palesa.tshabalala@psybergate.com', 'Python', 2),
  ('samuel.osei@psybergate.com', 'Python', 7),
  ('samuel.osei@psybergate.com', 'AWS', 5),
  ('samuel.osei@psybergate.com', 'SQL', 8),
  ('bianca.marais@psybergate.com', 'Agile Coaching', 3),
  ('vusi.radebe@psybergate.com', 'SQL', 4),
  ('deon.joubert@psybergate.com', 'Java', 10),
  ('deon.joubert@psybergate.com', 'AWS', 8),
  ('deon.joubert@psybergate.com', 'Kubernetes', 6),
  ('refilwe.monyane@psybergate.com', 'Java', 9),
  ('refilwe.monyane@psybergate.com', 'Spring Boot', 8),
  ('refilwe.monyane@psybergate.com', 'Angular', 5),
  ('grant.naicker@psybergate.com', 'Kubernetes', 5),
  ('grant.naicker@psybergate.com', 'Terraform', 5),
  ('grant.naicker@psybergate.com', 'AWS', 6),
  ('nonhlanhla.mkhize@psybergate.com', 'Docker', 4),
  ('nonhlanhla.mkhize@psybergate.com', 'AWS', 3),
  ('ahmed.suleiman@psybergate.com', 'Java', 2),
  ('ahmed.suleiman@psybergate.com', 'SQL', 2),
  ('lindiwe.skosana@psybergate.com', 'Angular', 2),
  ('lindiwe.skosana@psybergate.com', 'React', 1),
  ('brandon.smit@psybergate.com', 'Angular', 5),
  ('brandon.smit@psybergate.com', 'Java', 5),
  ('brandon.smit@psybergate.com', 'TypeScript', 5),
  ('yolanda.kunene@psybergate.com', 'SQL', 3),
  ('yolanda.kunene@psybergate.com', 'Docker', 1),
  ('trevor.adams@psybergate.com', 'Docker', 6),
  ('trevor.adams@psybergate.com', 'Kubernetes', 4),
  ('christopher.lee@psybergate.com', 'SQL', 1),
  ('christopher.lee@psybergate.com', 'Angular', 1)
) AS v(email, skill_name, years)
JOIN employees e ON e.email = v.email
JOIN skill s ON LOWER(s.name) = LOWER(v.skill_name)
WHERE NOT EXISTS (
  SELECT 1 FROM employee_skill es WHERE es.employee_id = e.id AND es.skill_id = s.id
);

-- ---------------------------------------------------------------------------
-- A handful of portfolio projects + education entries for the bulk roster,
-- with skill links, so the People profile pages and the "who's strong on X?"
-- project-count ranking have more than just Jane and John to show.
-- ---------------------------------------------------------------------------
INSERT INTO portfolio_projects (employee_id, name, description, start_date, end_date, url)
SELECT e.id, v.name, v.description, v.start_date, v.end_date, v.url
FROM (VALUES
  ('thabo.mokoena@psybergate.com', 'Payroll API Rebuild', 'Rebuilt the payroll microservice on Spring Boot.', DATE '2025-02-01', DATE '2025-08-15', NULL),
  ('amanda.pillay@psybergate.com', 'Design System Rollout', 'Rolled out the shared Angular component library.', DATE '2025-04-01', NULL, NULL),
  ('sipho.dlamini@psybergate.com', 'Kubernetes Migration', 'Migrated staging workloads onto Kubernetes.', DATE '2025-06-01', DATE '2026-01-31', NULL),
  ('johan.pretorius@psybergate.com', 'Cloud Cost Optimisation', 'Re-architected AWS spend across three services.', DATE '2025-01-10', DATE '2025-11-30', NULL),
  ('naledi.mabaso@psybergate.com', 'Client Portal Revamp', 'Led the Angular + Spring Boot rebuild of the client portal.', DATE '2024-09-01', DATE '2025-05-01', NULL),
  ('samuel.osei@psybergate.com', 'Analytics Warehouse', 'Built the Python/SQL pipeline feeding the reporting warehouse.', DATE '2025-03-01', NULL, NULL)
) AS v(email, name, description, start_date, end_date, url)
JOIN employees e ON e.email = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_projects pp WHERE pp.employee_id = e.id AND pp.name = v.name
);

INSERT INTO portfolio_education (employee_id, institution, qualification, field_of_study, start_year, end_year, description)
SELECT e.id, v.institution, v.qualification, v.field_of_study, v.start_year, v.end_year, NULL
FROM (VALUES
  ('thabo.mokoena@psybergate.com', 'University of the Witwatersrand', 'BSc Computer Science', 'Software Engineering', 2013, 2016),
  ('amanda.pillay@psybergate.com', 'University of KwaZulu-Natal', 'BSc Information Systems', 'Web Development', 2015, 2018),
  ('naledi.mabaso@psybergate.com', 'University of Pretoria', 'BEng Computer Engineering', 'Distributed Systems', 2011, 2015)
) AS v(email, institution, qualification, field_of_study, start_year, end_year)
JOIN employees e ON e.email = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_education pe WHERE pe.employee_id = e.id AND pe.institution = v.institution AND pe.qualification = v.qualification
);

INSERT INTO employee_skill_project (employee_skill_id, project_id)
SELECT es.id, pp.id
FROM (VALUES
  ('thabo.mokoena@psybergate.com', 'Spring Boot', 'Payroll API Rebuild'),
  ('thabo.mokoena@psybergate.com', 'Java', 'Payroll API Rebuild'),
  ('amanda.pillay@psybergate.com', 'Angular', 'Design System Rollout'),
  ('amanda.pillay@psybergate.com', 'TypeScript', 'Design System Rollout'),
  ('sipho.dlamini@psybergate.com', 'Kubernetes', 'Kubernetes Migration'),
  ('sipho.dlamini@psybergate.com', 'Docker', 'Kubernetes Migration'),
  ('johan.pretorius@psybergate.com', 'AWS', 'Cloud Cost Optimisation'),
  ('johan.pretorius@psybergate.com', 'Kubernetes', 'Cloud Cost Optimisation'),
  ('naledi.mabaso@psybergate.com', 'Angular', 'Client Portal Revamp'),
  ('naledi.mabaso@psybergate.com', 'Spring Boot', 'Client Portal Revamp'),
  ('samuel.osei@psybergate.com', 'Python', 'Analytics Warehouse'),
  ('samuel.osei@psybergate.com', 'SQL', 'Analytics Warehouse')
) AS v(email, skill_name, project_name)
JOIN employees e ON e.email = v.email
JOIN skill s ON LOWER(s.name) = LOWER(v.skill_name)
JOIN employee_skill es ON es.employee_id = e.id AND es.skill_id = s.id
JOIN portfolio_projects pp ON pp.employee_id = e.id AND pp.name = v.project_name
WHERE NOT EXISTS (
  SELECT 1 FROM employee_skill_project esp WHERE esp.employee_skill_id = es.id AND esp.project_id = pp.id
);