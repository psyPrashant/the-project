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
-- ---------------------------------------------------------------------------
-- Additional canonical skills covering non-engineering disciplines, so every
-- department has something to show in the Skills Register.
-- ---------------------------------------------------------------------------
INSERT INTO skill (name) SELECT 'Content Marketing' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'content marketing');
INSERT INTO skill (name) SELECT 'Customer Support' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'customer support');
INSERT INTO skill (name) SELECT 'Employee Relations' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'employee relations');
INSERT INTO skill (name) SELECT 'Employer Branding' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'employer branding');
INSERT INTO skill (name) SELECT 'Financial Modeling' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'financial modeling');
INSERT INTO skill (name) SELECT 'Negotiation' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'negotiation');
INSERT INTO skill (name) SELECT 'Product Strategy' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'product strategy');
INSERT INTO skill (name) SELECT 'Recruiting' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'recruiting');
INSERT INTO skill (name) SELECT 'SEO' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'seo');
INSERT INTO skill (name) SELECT 'SQL' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'sql');
INSERT INTO skill (name) SELECT 'Salesforce' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'salesforce');

-- ---------------------------------------------------------------------------
-- Full-roster skills: rounds out every employee (beyond the original
-- technical subset) with role-appropriate skills and years.
-- ---------------------------------------------------------------------------
INSERT INTO employee_skill (employee_id, skill_id, years)
SELECT e.id, s.id, v.years
FROM (VALUES
  ('farah.ismail@psybergate.com', 'Product Strategy', 4),
  ('farah.ismail@psybergate.com', 'SQL', 2),
  ('lerato.mahlangu@psybergate.com', 'Employee Relations', 7),
  ('lerato.mahlangu@psybergate.com', 'Recruiting', 5),
  ('david.chen@psybergate.com', 'Recruiting', 4),
  ('david.chen@psybergate.com', 'Employer Branding', 2),
  ('anele.zulu@psybergate.com', 'Financial Modeling', 4),
  ('anele.zulu@psybergate.com', 'SQL', 2),
  ('michael.fourie@psybergate.com', 'Negotiation', 6),
  ('michael.fourie@psybergate.com', 'Salesforce', 4),
  ('precious.nkosi@psybergate.com', 'Content Marketing', 6),
  ('precious.nkosi@psybergate.com', 'SEO', 5),
  ('thandiwe.cele@psybergate.com', 'Customer Support', 3),
  ('thandiwe.cele@psybergate.com', 'SQL', 1),
  ('nokuthula.buthelezi@psybergate.com', 'Product Strategy', 6),
  ('nokuthula.buthelezi@psybergate.com', 'SQL', 4),
  ('kirsten.human@psybergate.com', 'Employee Relations', 4),
  ('kirsten.human@psybergate.com', 'Recruiting', 2),
  ('andile.zwane@psybergate.com', 'Recruiting', 5),
  ('andile.zwane@psybergate.com', 'Employer Branding', 3),
  ('sarah.abrahams@psybergate.com', 'Financial Modeling', 5),
  ('sarah.abrahams@psybergate.com', 'SQL', 3),
  ('themba.nxumalo@psybergate.com', 'Negotiation', 7),
  ('themba.nxumalo@psybergate.com', 'Salesforce', 5),
  ('emily.roberts@psybergate.com', 'Content Marketing', 3),
  ('emily.roberts@psybergate.com', 'SEO', 2),
  ('sizwe.khoza@psybergate.com', 'Customer Support', 4),
  ('sizwe.khoza@psybergate.com', 'SQL', 2),
  ('puleng.seleka@psybergate.com', 'Product Strategy', 7),
  ('puleng.seleka@psybergate.com', 'SQL', 5)
) AS v(email, skill_name, years)
JOIN employees e ON e.email = v.email
JOIN skill s ON LOWER(s.name) = LOWER(v.skill_name)
WHERE NOT EXISTS (
  SELECT 1 FROM employee_skill es WHERE es.employee_id = e.id AND es.skill_id = s.id
);

-- ---------------------------------------------------------------------------
-- Full-roster projects: one showcase project per remaining employee.
-- ---------------------------------------------------------------------------
INSERT INTO portfolio_projects (employee_id, name, description, start_date, end_date, url)
SELECT e.id, v.name, v.description, v.start_date, v.end_date, NULL
FROM (VALUES
  ('admin@psybergate.com', 'Internal Platform Initiative', 'Contributed to the platform rollout.', DATE '2025-01-01', NULL),
  ('nomvula.khumalo@psybergate.com', 'Engineering Portfolio Initiative', 'Built the automated regression suite for the portfolio module.', DATE '2025-07-01', NULL),
  ('werner.botha@psybergate.com', 'Engineering Core services Initiative', 'Ran the core services team through a full delivery quarter.', DATE '2025-08-01', DATE '2025-12-15'),
  ('farah.ismail@psybergate.com', 'Product Tasks module Initiative', 'Owned the roadmap for the tasks module product line.', DATE '2025-09-01', DATE '2025-12-15'),
  ('liam.oconnor@psybergate.com', 'Design Onboarding Initiative', 'Redesigned the onboarding flow after a round of user research.', DATE '2025-10-01', NULL),
  ('zanele.ndlovu@psybergate.com', 'Design Design system Initiative', 'Built the component library for the design system redesign.', DATE '2025-01-01', DATE '2025-05-15'),
  ('rajesh.naidoo@psybergate.com', 'Data Attrition Initiative', 'Published the attrition reporting dashboard for leadership.', DATE '2025-02-01', DATE '2025-06-15'),
  ('chloe.vandermerwe@psybergate.com', 'Data Ingestion Initiative', 'Built the ingestion pipeline feeding the analytics warehouse.', DATE '2025-03-01', NULL),
  ('mpho.sithole@psybergate.com', 'Engineering Data Initiative', 'Coached the data team through their agile transformation.', DATE '2025-04-01', DATE '2025-08-15'),
  ('karabo.molefe@psybergate.com', 'Product Portfolio Initiative', 'Gathered and signed off requirements for the portfolio module.', DATE '2025-05-01', DATE '2025-09-15'),
  ('lerato.mahlangu@psybergate.com', 'People Engagement survey Initiative', 'Ran the engagement survey initiative across the engineering org.', DATE '2025-06-01', NULL),
  ('david.chen@psybergate.com', 'People Graduate Initiative', 'Led the graduate hiring drive.', DATE '2025-07-01', DATE '2025-11-15'),
  ('anele.zulu@psybergate.com', 'Finance Departmental budget Initiative', 'Built the departmental budget forecasting model for FY26.', DATE '2025-08-01', DATE '2025-12-15'),
  ('michael.fourie@psybergate.com', 'Sales Enterprise Initiative', 'Closed the enterprise account after a six-month pipeline.', DATE '2025-09-01', NULL),
  ('precious.nkosi@psybergate.com', 'Marketing Brand refresh Initiative', 'Ran the brand refresh campaign across web and social.', DATE '2025-10-01', DATE '2025-12-15'),
  ('thandiwe.cele@psybergate.com', 'Support Support Initiative', 'Reduced ticket backlog by overhauling the support triage process.', DATE '2025-01-01', DATE '2025-05-15'),
  ('kevin.govender@psybergate.com', 'Platform Observability Initiative', 'Cut incident MTTR in half by rebuilding the observability runbooks.', DATE '2025-04-01', DATE '2025-08-15'),
  ('bongani.mthembu@psybergate.com', 'Platform Penetration test Initiative', 'Closed out the penetration test audit findings ahead of schedule.', DATE '2025-05-01', NULL),
  ('aisha.adams@psybergate.com', 'Engineering Billing Initiative', 'Rebuilt the billing service on Spring Boot.', DATE '2025-06-01', DATE '2025-10-15'),
  ('pieter.steyn@psybergate.com', 'Engineering Profile Initiative', 'Led the Angular rebuild of the profile screens.', DATE '2025-07-01', DATE '2025-11-15'),
  ('zola.gumede@psybergate.com', 'Engineering Self-service portal Initiative', 'Delivered the self-service portal feature end to end (API + UI).', DATE '2025-08-01', NULL),
  ('fatima.patel@psybergate.com', 'Engineering Billing Initiative', 'Built the automated regression suite for the billing module.', DATE '2025-09-01', DATE '2025-12-15'),
  ('ryan.debeer@psybergate.com', 'Platform Infrastructure provisioning Initiative', 'Automated the infrastructure provisioning pipeline with Terraform and Docker.', DATE '2025-10-01', DATE '2025-12-15'),
  ('nokuthula.buthelezi@psybergate.com', 'Product Engagement platform Initiative', 'Owned the roadmap for the engagement platform product line.', DATE '2025-01-01', NULL),
  ('craig.williams@psybergate.com', 'Design Profile Initiative', 'Redesigned the profile flow after a round of user research.', DATE '2025-02-01', DATE '2025-06-15'),
  ('palesa.tshabalala@psybergate.com', 'Data Attrition Initiative', 'Published the attrition reporting dashboard for leadership.', DATE '2025-03-01', DATE '2025-07-15'),
  ('bianca.marais@psybergate.com', 'Engineering Platform Initiative', 'Coached the platform team through their agile transformation.', DATE '2025-05-01', DATE '2025-09-15'),
  ('vusi.radebe@psybergate.com', 'Product Portfolio Initiative', 'Gathered and signed off requirements for the portfolio module.', DATE '2025-06-01', DATE '2025-10-15'),
  ('kirsten.human@psybergate.com', 'People Onboarding revamp Initiative', 'Ran the onboarding revamp initiative across the engineering org.', DATE '2025-07-01', NULL),
  ('andile.zwane@psybergate.com', 'People Senior engineering Initiative', 'Led the senior engineering hiring drive.', DATE '2025-08-01', DATE '2025-12-15'),
  ('sarah.abrahams@psybergate.com', 'Finance Headcount cost Initiative', 'Built the headcount cost forecasting model for FY26.', DATE '2025-09-01', DATE '2025-12-15'),
  ('themba.nxumalo@psybergate.com', 'Sales Mid-market Initiative', 'Closed the mid-market account after a six-month pipeline.', DATE '2025-10-01', NULL),
  ('emily.roberts@psybergate.com', 'Marketing Product launch Initiative', 'Ran the product launch campaign across web and social.', DATE '2025-01-01', DATE '2025-05-15'),
  ('sizwe.khoza@psybergate.com', 'Support Incident Initiative', 'Reduced ticket backlog by overhauling the incident triage process.', DATE '2025-02-01', DATE '2025-06-15'),
  ('deon.joubert@psybergate.com', 'Engineering Integration Initiative', 'Designed the target architecture for the integration platform.', DATE '2025-03-01', NULL),
  ('refilwe.monyane@psybergate.com', 'Engineering Reporting suite Initiative', 'Led the engineering delivery of the reporting suite rebuild.', DATE '2025-04-01', DATE '2025-08-15'),
  ('grant.naicker@psybergate.com', 'Platform On-call Initiative', 'Cut incident MTTR in half by rebuilding the on-call runbooks.', DATE '2025-05-01', DATE '2025-09-15'),
  ('nonhlanhla.mkhize@psybergate.com', 'Platform Compliance Initiative', 'Closed out the compliance audit findings ahead of schedule.', DATE '2025-06-01', NULL),
  ('ahmed.suleiman@psybergate.com', 'Engineering Notifications Initiative', 'Rebuilt the notifications service on Spring Boot.', DATE '2025-07-01', DATE '2025-11-15'),
  ('lindiwe.skosana@psybergate.com', 'Engineering Search Initiative', 'Led the Angular rebuild of the search screens.', DATE '2025-08-01', DATE '2025-12-15'),
  ('brandon.smit@psybergate.com', 'Engineering Self-service portal Initiative', 'Delivered the self-service portal feature end to end (API + UI).', DATE '2025-09-01', NULL),
  ('yolanda.kunene@psybergate.com', 'Engineering Employee Initiative', 'Built the automated regression suite for the employee module.', DATE '2025-10-01', DATE '2025-12-15'),
  ('trevor.adams@psybergate.com', 'Platform Infrastructure provisioning Initiative', 'Automated the infrastructure provisioning pipeline with Terraform and Docker.', DATE '2025-01-01', DATE '2025-05-15'),
  ('puleng.seleka@psybergate.com', 'Product Engagement platform Initiative', 'Owned the roadmap for the engagement platform product line.', DATE '2025-02-01', NULL),
  ('christopher.lee@psybergate.com', 'Engineering Skills register search Initiative', 'Shipped the skills register search feature as a six-month intern project.', DATE '2025-03-01', DATE '2025-07-15')
) AS v(email, name, description, start_date, end_date)
JOIN employees e ON e.email = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_projects pp WHERE pp.employee_id = e.id AND pp.name = v.name
);

-- ---------------------------------------------------------------------------
-- Full-roster education: one qualification per remaining employee.
-- ---------------------------------------------------------------------------
INSERT INTO portfolio_education (employee_id, institution, qualification, field_of_study, start_year, end_year, description)
SELECT e.id, v.institution, v.qualification, v.field_of_study, v.start_year, v.end_year, NULL
FROM (VALUES
  ('admin@psybergate.com', 'University of Cape Town', 'BSc Information Systems', 'Software Engineering', 2008, 2011),
  ('sipho.dlamini@psybergate.com', 'Rhodes University', 'BEng Electronic Engineering', 'Embedded Systems', 2013, 2016),
  ('nomvula.khumalo@psybergate.com', 'Nelson Mandela University', 'BSc Computer Science', 'Quality Engineering', 2014, 2017),
  ('werner.botha@psybergate.com', 'University of Johannesburg', 'BSc Computer Science', 'Software Engineering', 2015, 2018),
  ('farah.ismail@psybergate.com', 'North-West University', 'BCom Business Science', 'Strategy and Innovation', 2016, 2019),
  ('liam.oconnor@psybergate.com', 'University of Cape Town', 'BA Design', 'Interaction Design', 2017, 2020),
  ('zanele.ndlovu@psybergate.com', 'University of the Witwatersrand', 'BA Visual Communication', 'Digital Design', 2018, 2021),
  ('rajesh.naidoo@psybergate.com', 'Stellenbosch University', 'BSc Statistics', 'Data Science', 2019, 2022),
  ('chloe.vandermerwe@psybergate.com', 'University of Pretoria', 'BSc Computer Science', 'Data Engineering', 2008, 2011),
  ('mpho.sithole@psybergate.com', 'University of KwaZulu-Natal', 'BCom Business Management', 'Organisational Psychology', 2009, 2012),
  ('karabo.molefe@psybergate.com', 'Rhodes University', 'BCom Informatics', 'Business Analysis', 2010, 2013),
  ('lerato.mahlangu@psybergate.com', 'Nelson Mandela University', 'BA Industrial Psychology', 'Human Resource Management', 2011, 2014),
  ('david.chen@psybergate.com', 'University of Johannesburg', 'BA Human Resource Management', 'People Management', 2012, 2015),
  ('anele.zulu@psybergate.com', 'North-West University', 'BCom Accounting', 'Finance', 2013, 2016),
  ('michael.fourie@psybergate.com', 'University of Cape Town', 'BCom Marketing', 'Sales Management', 2014, 2017),
  ('precious.nkosi@psybergate.com', 'University of the Witwatersrand', 'BA Marketing', 'Communication Science', 2015, 2018),
  ('thandiwe.cele@psybergate.com', 'Stellenbosch University', 'BSc Information Technology', 'Computer Science', 2016, 2019),
  ('johan.pretorius@psybergate.com', 'University of Pretoria', 'BEng Computer Engineering', 'Distributed Systems', 2017, 2020),
  ('kevin.govender@psybergate.com', 'Rhodes University', 'BSc Computer Science', 'Systems Engineering', 2019, 2022),
  ('bongani.mthembu@psybergate.com', 'Nelson Mandela University', 'BSc Computer Science', 'Information Security', 2008, 2011),
  ('aisha.adams@psybergate.com', 'University of Johannesburg', 'BSc Computer Science', 'Software Engineering', 2009, 2012),
  ('pieter.steyn@psybergate.com', 'North-West University', 'BSc Information Systems', 'Web Development', 2010, 2013),
  ('zola.gumede@psybergate.com', 'University of Cape Town', 'BSc Computer Science', 'Software Engineering', 2011, 2014),
  ('fatima.patel@psybergate.com', 'University of the Witwatersrand', 'BSc Computer Science', 'Quality Engineering', 2012, 2015),
  ('ryan.debeer@psybergate.com', 'Stellenbosch University', 'BEng Electronic Engineering', 'Embedded Systems', 2013, 2016),
  ('nokuthula.buthelezi@psybergate.com', 'University of Pretoria', 'BCom Business Science', 'Strategy and Innovation', 2014, 2017),
  ('craig.williams@psybergate.com', 'University of KwaZulu-Natal', 'BA Design', 'Interaction Design', 2015, 2018),
  ('palesa.tshabalala@psybergate.com', 'Rhodes University', 'BSc Statistics', 'Data Science', 2016, 2019),
  ('samuel.osei@psybergate.com', 'Nelson Mandela University', 'BSc Computer Science', 'Data Engineering', 2017, 2020),
  ('bianca.marais@psybergate.com', 'University of Johannesburg', 'BCom Business Management', 'Organisational Psychology', 2018, 2021),
  ('vusi.radebe@psybergate.com', 'North-West University', 'BCom Informatics', 'Business Analysis', 2019, 2022),
  ('kirsten.human@psybergate.com', 'University of Cape Town', 'BA Industrial Psychology', 'Human Resource Management', 2008, 2011),
  ('andile.zwane@psybergate.com', 'University of the Witwatersrand', 'BA Human Resource Management', 'People Management', 2009, 2012),
  ('sarah.abrahams@psybergate.com', 'Stellenbosch University', 'BCom Accounting', 'Finance', 2010, 2013),
  ('themba.nxumalo@psybergate.com', 'University of Pretoria', 'BCom Marketing', 'Sales Management', 2011, 2014),
  ('emily.roberts@psybergate.com', 'University of KwaZulu-Natal', 'BA Marketing', 'Communication Science', 2012, 2015),
  ('sizwe.khoza@psybergate.com', 'Rhodes University', 'BSc Information Technology', 'Computer Science', 2013, 2016),
  ('deon.joubert@psybergate.com', 'Nelson Mandela University', 'BEng Computer Engineering', 'Distributed Systems', 2014, 2017),
  ('refilwe.monyane@psybergate.com', 'University of Johannesburg', 'BSc Computer Science', 'Software Engineering', 2015, 2018),
  ('grant.naicker@psybergate.com', 'North-West University', 'BSc Computer Science', 'Systems Engineering', 2016, 2019),
  ('nonhlanhla.mkhize@psybergate.com', 'University of Cape Town', 'BSc Computer Science', 'Information Security', 2017, 2020),
  ('ahmed.suleiman@psybergate.com', 'University of the Witwatersrand', 'BSc Computer Science', 'Software Engineering', 2018, 2021),
  ('lindiwe.skosana@psybergate.com', 'Stellenbosch University', 'BSc Information Systems', 'Web Development', 2019, 2022),
  ('brandon.smit@psybergate.com', 'University of Pretoria', 'BSc Computer Science', 'Software Engineering', 2008, 2011),
  ('yolanda.kunene@psybergate.com', 'University of KwaZulu-Natal', 'BSc Computer Science', 'Quality Engineering', 2009, 2012),
  ('trevor.adams@psybergate.com', 'Rhodes University', 'BEng Electronic Engineering', 'Embedded Systems', 2010, 2013),
  ('puleng.seleka@psybergate.com', 'Nelson Mandela University', 'BCom Business Science', 'Strategy and Innovation', 2011, 2014),
  ('christopher.lee@psybergate.com', 'University of Johannesburg', 'BSc Computer Science', 'Software Engineering', 2012, 2015)
) AS v(email, institution, qualification, field_of_study, start_year, end_year)
JOIN employees e ON e.email = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_education pe WHERE pe.employee_id = e.id AND pe.institution = v.institution AND pe.qualification = v.qualification
);

-- ---------------------------------------------------------------------------
-- Full-roster showcase links: LinkedIn for everyone, GitHub for technical
-- roles.
-- ---------------------------------------------------------------------------
INSERT INTO portfolio_links (employee_id, label, url, sort_order)
SELECT e.id, v.label, v.url, v.sort_order
FROM (VALUES
  ('admin@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/admin-user', 1),
  ('thabo.mokoena@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/thabo-mokoena', 1),
  ('thabo.mokoena@psybergate.com', 'GitHub', 'https://github.com/thabomokoena', 2),
  ('amanda.pillay@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/amanda-pillay', 1),
  ('amanda.pillay@psybergate.com', 'GitHub', 'https://github.com/amandapillay', 2),
  ('sipho.dlamini@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/sipho-dlamini', 1),
  ('sipho.dlamini@psybergate.com', 'GitHub', 'https://github.com/siphodlamini', 2),
  ('nomvula.khumalo@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/nomvula-khumalo', 1),
  ('nomvula.khumalo@psybergate.com', 'GitHub', 'https://github.com/nomvulakhumalo', 2),
  ('werner.botha@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/werner-botha', 1),
  ('farah.ismail@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/farah-ismail', 1),
  ('liam.oconnor@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/liam-oconnor', 1),
  ('zanele.ndlovu@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/zanele-ndlovu', 1),
  ('rajesh.naidoo@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/rajesh-naidoo', 1),
  ('chloe.vandermerwe@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/chloe-vandermerwe', 1),
  ('chloe.vandermerwe@psybergate.com', 'GitHub', 'https://github.com/chloevandermerwe', 2),
  ('mpho.sithole@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/mpho-sithole', 1),
  ('karabo.molefe@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/karabo-molefe', 1),
  ('lerato.mahlangu@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/lerato-mahlangu', 1),
  ('david.chen@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/david-chen', 1),
  ('anele.zulu@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/anele-zulu', 1),
  ('michael.fourie@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/michael-fourie', 1),
  ('precious.nkosi@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/precious-nkosi', 1),
  ('thandiwe.cele@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/thandiwe-cele', 1),
  ('johan.pretorius@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/johan-pretorius', 1),
  ('johan.pretorius@psybergate.com', 'GitHub', 'https://github.com/johanpretorius', 2),
  ('naledi.mabaso@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/naledi-mabaso', 1),
  ('naledi.mabaso@psybergate.com', 'GitHub', 'https://github.com/naledimabaso', 2),
  ('kevin.govender@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/kevin-govender', 1),
  ('kevin.govender@psybergate.com', 'GitHub', 'https://github.com/kevingovender', 2),
  ('bongani.mthembu@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/bongani-mthembu', 1),
  ('bongani.mthembu@psybergate.com', 'GitHub', 'https://github.com/bonganimthembu', 2),
  ('aisha.adams@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/aisha-adams', 1),
  ('aisha.adams@psybergate.com', 'GitHub', 'https://github.com/aishaadams', 2),
  ('pieter.steyn@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/pieter-steyn', 1),
  ('pieter.steyn@psybergate.com', 'GitHub', 'https://github.com/pietersteyn', 2),
  ('zola.gumede@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/zola-gumede', 1),
  ('zola.gumede@psybergate.com', 'GitHub', 'https://github.com/zolagumede', 2),
  ('fatima.patel@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/fatima-patel', 1),
  ('fatima.patel@psybergate.com', 'GitHub', 'https://github.com/fatimapatel', 2),
  ('ryan.debeer@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/ryan-debeer', 1),
  ('ryan.debeer@psybergate.com', 'GitHub', 'https://github.com/ryandebeer', 2),
  ('nokuthula.buthelezi@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/nokuthula-buthelezi', 1),
  ('craig.williams@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/craig-williams', 1),
  ('palesa.tshabalala@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/palesa-tshabalala', 1),
  ('samuel.osei@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/samuel-osei', 1),
  ('samuel.osei@psybergate.com', 'GitHub', 'https://github.com/samuelosei', 2),
  ('bianca.marais@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/bianca-marais', 1),
  ('vusi.radebe@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/vusi-radebe', 1),
  ('kirsten.human@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/kirsten-human', 1),
  ('andile.zwane@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/andile-zwane', 1),
  ('sarah.abrahams@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/sarah-abrahams', 1),
  ('themba.nxumalo@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/themba-nxumalo', 1),
  ('emily.roberts@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/emily-roberts', 1),
  ('sizwe.khoza@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/sizwe-khoza', 1),
  ('deon.joubert@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/deon-joubert', 1),
  ('deon.joubert@psybergate.com', 'GitHub', 'https://github.com/deonjoubert', 2),
  ('refilwe.monyane@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/refilwe-monyane', 1),
  ('refilwe.monyane@psybergate.com', 'GitHub', 'https://github.com/refilwemonyane', 2),
  ('grant.naicker@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/grant-naicker', 1),
  ('grant.naicker@psybergate.com', 'GitHub', 'https://github.com/grantnaicker', 2),
  ('nonhlanhla.mkhize@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/nonhlanhla-mkhize', 1),
  ('nonhlanhla.mkhize@psybergate.com', 'GitHub', 'https://github.com/nonhlanhlamkhize', 2),
  ('ahmed.suleiman@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/ahmed-suleiman', 1),
  ('ahmed.suleiman@psybergate.com', 'GitHub', 'https://github.com/ahmedsuleiman', 2),
  ('lindiwe.skosana@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/lindiwe-skosana', 1),
  ('lindiwe.skosana@psybergate.com', 'GitHub', 'https://github.com/lindiweskosana', 2),
  ('brandon.smit@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/brandon-smit', 1),
  ('brandon.smit@psybergate.com', 'GitHub', 'https://github.com/brandonsmit', 2),
  ('yolanda.kunene@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/yolanda-kunene', 1),
  ('yolanda.kunene@psybergate.com', 'GitHub', 'https://github.com/yolandakunene', 2),
  ('trevor.adams@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/trevor-adams', 1),
  ('trevor.adams@psybergate.com', 'GitHub', 'https://github.com/trevoradams', 2),
  ('puleng.seleka@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/puleng-seleka', 1),
  ('christopher.lee@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/christopher-lee', 1),
  ('christopher.lee@psybergate.com', 'GitHub', 'https://github.com/christopherlee', 2)
) AS v(email, label, url, sort_order)
JOIN employees e ON e.email = v.email
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_links pl WHERE pl.employee_id = e.id AND pl.label = v.label
);

-- ---------------------------------------------------------------------------
-- Skill-to-project links for the full roster (non-zero project counts in the
-- Skills Register ranking).
-- ---------------------------------------------------------------------------
INSERT INTO employee_skill_project (employee_skill_id, project_id)
SELECT es.id, pp.id
FROM (VALUES
  ('nomvula.khumalo@psybergate.com', 'SQL', 'Engineering Portfolio Initiative'),
  ('werner.botha@psybergate.com', 'Java', 'Engineering Core services Initiative'),
  ('farah.ismail@psybergate.com', 'Product Strategy', 'Product Tasks module Initiative'),
  ('liam.oconnor@psybergate.com', 'Figma', 'Design Onboarding Initiative'),
  ('zanele.ndlovu@psybergate.com', 'Figma', 'Design Design system Initiative'),
  ('rajesh.naidoo@psybergate.com', 'SQL', 'Data Attrition Initiative'),
  ('chloe.vandermerwe@psybergate.com', 'Python', 'Data Ingestion Initiative'),
  ('mpho.sithole@psybergate.com', 'Agile Coaching', 'Engineering Data Initiative'),
  ('karabo.molefe@psybergate.com', 'SQL', 'Product Portfolio Initiative'),
  ('lerato.mahlangu@psybergate.com', 'Employee Relations', 'People Engagement survey Initiative'),
  ('david.chen@psybergate.com', 'Recruiting', 'People Graduate Initiative'),
  ('anele.zulu@psybergate.com', 'Financial Modeling', 'Finance Departmental budget Initiative'),
  ('michael.fourie@psybergate.com', 'Negotiation', 'Sales Enterprise Initiative'),
  ('precious.nkosi@psybergate.com', 'Content Marketing', 'Marketing Brand refresh Initiative'),
  ('thandiwe.cele@psybergate.com', 'Customer Support', 'Support Support Initiative'),
  ('kevin.govender@psybergate.com', 'Kubernetes', 'Platform Observability Initiative'),
  ('bongani.mthembu@psybergate.com', 'Docker', 'Platform Penetration test Initiative'),
  ('aisha.adams@psybergate.com', 'Java', 'Engineering Billing Initiative'),
  ('pieter.steyn@psybergate.com', 'Angular', 'Engineering Profile Initiative'),
  ('zola.gumede@psybergate.com', 'Angular', 'Engineering Self-service portal Initiative'),
  ('fatima.patel@psybergate.com', 'SQL', 'Engineering Billing Initiative'),
  ('ryan.debeer@psybergate.com', 'Docker', 'Platform Infrastructure provisioning Initiative'),
  ('nokuthula.buthelezi@psybergate.com', 'Product Strategy', 'Product Engagement platform Initiative'),
  ('craig.williams@psybergate.com', 'Figma', 'Design Profile Initiative'),
  ('palesa.tshabalala@psybergate.com', 'SQL', 'Data Attrition Initiative'),
  ('bianca.marais@psybergate.com', 'Agile Coaching', 'Engineering Platform Initiative'),
  ('vusi.radebe@psybergate.com', 'SQL', 'Product Portfolio Initiative'),
  ('kirsten.human@psybergate.com', 'Employee Relations', 'People Onboarding revamp Initiative'),
  ('andile.zwane@psybergate.com', 'Recruiting', 'People Senior engineering Initiative'),
  ('sarah.abrahams@psybergate.com', 'Financial Modeling', 'Finance Headcount cost Initiative'),
  ('themba.nxumalo@psybergate.com', 'Negotiation', 'Sales Mid-market Initiative'),
  ('emily.roberts@psybergate.com', 'Content Marketing', 'Marketing Product launch Initiative'),
  ('sizwe.khoza@psybergate.com', 'Customer Support', 'Support Incident Initiative'),
  ('deon.joubert@psybergate.com', 'Java', 'Engineering Integration Initiative'),
  ('refilwe.monyane@psybergate.com', 'Java', 'Engineering Reporting suite Initiative'),
  ('grant.naicker@psybergate.com', 'Kubernetes', 'Platform On-call Initiative'),
  ('nonhlanhla.mkhize@psybergate.com', 'Docker', 'Platform Compliance Initiative'),
  ('ahmed.suleiman@psybergate.com', 'Java', 'Engineering Notifications Initiative'),
  ('lindiwe.skosana@psybergate.com', 'Angular', 'Engineering Search Initiative'),
  ('brandon.smit@psybergate.com', 'Angular', 'Engineering Self-service portal Initiative'),
  ('yolanda.kunene@psybergate.com', 'SQL', 'Engineering Employee Initiative'),
  ('trevor.adams@psybergate.com', 'Docker', 'Platform Infrastructure provisioning Initiative'),
  ('puleng.seleka@psybergate.com', 'Product Strategy', 'Product Engagement platform Initiative'),
  ('christopher.lee@psybergate.com', 'SQL', 'Engineering Skills register search Initiative')
) AS v(email, skill_name, project_name)
JOIN employees e ON e.email = v.email
JOIN skill s ON LOWER(s.name) = LOWER(v.skill_name)
JOIN employee_skill es ON es.employee_id = e.id AND es.skill_id = s.id
JOIN portfolio_projects pp ON pp.employee_id = e.id AND pp.name = v.project_name
WHERE NOT EXISTS (
  SELECT 1 FROM employee_skill_project esp WHERE esp.employee_skill_id = es.id AND esp.project_id = pp.id
);

-- ---------------------------------------------------------------------------
-- Full-roster interactions: a manager/lead check-in logged against every
-- remaining employee, so the People profile timelines are not empty.
-- ---------------------------------------------------------------------------
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: discussed goals, workload and growth areas.', 'MEETING', DATE '2026-01-01'
FROM employees a, employees s
WHERE a.email = 'werner.botha@psybergate.com' AND s.email = 'admin@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: discussed goals, workload and growth areas.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Left a note after the sprint review — good progress, keep it up.', 'NOTE', DATE '2026-03-03'
FROM employees a, employees s
WHERE a.email = 'lerato.mahlangu@psybergate.com' AND s.email = 'john.smith@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Left a note after the sprint review — good progress, keep it up.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-04-04'
FROM employees a, employees s
WHERE a.email = 'naledi.mabaso@psybergate.com' AND s.email = 'thabo.mokoena@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: reviewed recent work and agreed next steps.', 'MEETING', DATE '2026-05-05'
FROM employees a, employees s
WHERE a.email = 'nokuthula.buthelezi@psybergate.com' AND s.email = 'amanda.pillay@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: reviewed recent work and agreed next steps.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: discussed goals, workload and growth areas.', 'MEETING', DATE '2026-06-06'
FROM employees a, employees s
WHERE a.email = 'kirsten.human@psybergate.com' AND s.email = 'sipho.dlamini@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: discussed goals, workload and growth areas.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Called to catch up on current priorities and blockers.', 'CALL', DATE '2026-01-07'
FROM employees a, employees s
WHERE a.email = 'refilwe.monyane@psybergate.com' AND s.email = 'nomvula.khumalo@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Called to catch up on current priorities and blockers.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Left a note after the sprint review — good progress, keep it up.', 'NOTE', DATE '2026-02-08'
FROM employees a, employees s
WHERE a.email = 'puleng.seleka@psybergate.com' AND s.email = 'werner.botha@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Left a note after the sprint review — good progress, keep it up.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-03-09'
FROM employees a, employees s
WHERE a.email = 'werner.botha@psybergate.com' AND s.email = 'farah.ismail@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: reviewed recent work and agreed next steps.', 'MEETING', DATE '2026-04-10'
FROM employees a, employees s
WHERE a.email = 'farah.ismail@psybergate.com' AND s.email = 'liam.oconnor@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: reviewed recent work and agreed next steps.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: discussed goals, workload and growth areas.', 'MEETING', DATE '2026-05-11'
FROM employees a, employees s
WHERE a.email = 'lerato.mahlangu@psybergate.com' AND s.email = 'zanele.ndlovu@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: discussed goals, workload and growth areas.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Called to catch up on current priorities and blockers.', 'CALL', DATE '2026-06-12'
FROM employees a, employees s
WHERE a.email = 'naledi.mabaso@psybergate.com' AND s.email = 'rajesh.naidoo@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Called to catch up on current priorities and blockers.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Left a note after the sprint review — good progress, keep it up.', 'NOTE', DATE '2026-01-13'
FROM employees a, employees s
WHERE a.email = 'nokuthula.buthelezi@psybergate.com' AND s.email = 'chloe.vandermerwe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Left a note after the sprint review — good progress, keep it up.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-02-14'
FROM employees a, employees s
WHERE a.email = 'kirsten.human@psybergate.com' AND s.email = 'mpho.sithole@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: reviewed recent work and agreed next steps.', 'MEETING', DATE '2026-03-15'
FROM employees a, employees s
WHERE a.email = 'refilwe.monyane@psybergate.com' AND s.email = 'karabo.molefe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: reviewed recent work and agreed next steps.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: discussed goals, workload and growth areas.', 'MEETING', DATE '2026-04-16'
FROM employees a, employees s
WHERE a.email = 'puleng.seleka@psybergate.com' AND s.email = 'lerato.mahlangu@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: discussed goals, workload and growth areas.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Called to catch up on current priorities and blockers.', 'CALL', DATE '2026-05-17'
FROM employees a, employees s
WHERE a.email = 'werner.botha@psybergate.com' AND s.email = 'david.chen@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Called to catch up on current priorities and blockers.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Left a note after the sprint review — good progress, keep it up.', 'NOTE', DATE '2026-06-18'
FROM employees a, employees s
WHERE a.email = 'farah.ismail@psybergate.com' AND s.email = 'anele.zulu@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Left a note after the sprint review — good progress, keep it up.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-01-19'
FROM employees a, employees s
WHERE a.email = 'lerato.mahlangu@psybergate.com' AND s.email = 'michael.fourie@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: reviewed recent work and agreed next steps.', 'MEETING', DATE '2026-02-20'
FROM employees a, employees s
WHERE a.email = 'naledi.mabaso@psybergate.com' AND s.email = 'precious.nkosi@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: reviewed recent work and agreed next steps.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: discussed goals, workload and growth areas.', 'MEETING', DATE '2026-03-21'
FROM employees a, employees s
WHERE a.email = 'nokuthula.buthelezi@psybergate.com' AND s.email = 'thandiwe.cele@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: discussed goals, workload and growth areas.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Called to catch up on current priorities and blockers.', 'CALL', DATE '2026-04-22'
FROM employees a, employees s
WHERE a.email = 'kirsten.human@psybergate.com' AND s.email = 'johan.pretorius@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Called to catch up on current priorities and blockers.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Left a note after the sprint review — good progress, keep it up.', 'NOTE', DATE '2026-05-23'
FROM employees a, employees s
WHERE a.email = 'refilwe.monyane@psybergate.com' AND s.email = 'naledi.mabaso@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Left a note after the sprint review — good progress, keep it up.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-06-24'
FROM employees a, employees s
WHERE a.email = 'puleng.seleka@psybergate.com' AND s.email = 'kevin.govender@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: reviewed recent work and agreed next steps.', 'MEETING', DATE '2026-01-25'
FROM employees a, employees s
WHERE a.email = 'werner.botha@psybergate.com' AND s.email = 'bongani.mthembu@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: reviewed recent work and agreed next steps.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: discussed goals, workload and growth areas.', 'MEETING', DATE '2026-02-26'
FROM employees a, employees s
WHERE a.email = 'farah.ismail@psybergate.com' AND s.email = 'aisha.adams@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: discussed goals, workload and growth areas.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Called to catch up on current priorities and blockers.', 'CALL', DATE '2026-03-27'
FROM employees a, employees s
WHERE a.email = 'lerato.mahlangu@psybergate.com' AND s.email = 'pieter.steyn@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Called to catch up on current priorities and blockers.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Left a note after the sprint review — good progress, keep it up.', 'NOTE', DATE '2026-04-01'
FROM employees a, employees s
WHERE a.email = 'naledi.mabaso@psybergate.com' AND s.email = 'zola.gumede@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Left a note after the sprint review — good progress, keep it up.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-05-02'
FROM employees a, employees s
WHERE a.email = 'nokuthula.buthelezi@psybergate.com' AND s.email = 'fatima.patel@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: reviewed recent work and agreed next steps.', 'MEETING', DATE '2026-06-03'
FROM employees a, employees s
WHERE a.email = 'kirsten.human@psybergate.com' AND s.email = 'ryan.debeer@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: reviewed recent work and agreed next steps.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: discussed goals, workload and growth areas.', 'MEETING', DATE '2026-01-04'
FROM employees a, employees s
WHERE a.email = 'refilwe.monyane@psybergate.com' AND s.email = 'nokuthula.buthelezi@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: discussed goals, workload and growth areas.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Called to catch up on current priorities and blockers.', 'CALL', DATE '2026-02-05'
FROM employees a, employees s
WHERE a.email = 'puleng.seleka@psybergate.com' AND s.email = 'craig.williams@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Called to catch up on current priorities and blockers.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Left a note after the sprint review — good progress, keep it up.', 'NOTE', DATE '2026-03-06'
FROM employees a, employees s
WHERE a.email = 'werner.botha@psybergate.com' AND s.email = 'palesa.tshabalala@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Left a note after the sprint review — good progress, keep it up.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-04-07'
FROM employees a, employees s
WHERE a.email = 'farah.ismail@psybergate.com' AND s.email = 'samuel.osei@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: reviewed recent work and agreed next steps.', 'MEETING', DATE '2026-05-08'
FROM employees a, employees s
WHERE a.email = 'lerato.mahlangu@psybergate.com' AND s.email = 'bianca.marais@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: reviewed recent work and agreed next steps.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: discussed goals, workload and growth areas.', 'MEETING', DATE '2026-06-09'
FROM employees a, employees s
WHERE a.email = 'naledi.mabaso@psybergate.com' AND s.email = 'vusi.radebe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: discussed goals, workload and growth areas.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Called to catch up on current priorities and blockers.', 'CALL', DATE '2026-01-10'
FROM employees a, employees s
WHERE a.email = 'nokuthula.buthelezi@psybergate.com' AND s.email = 'kirsten.human@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Called to catch up on current priorities and blockers.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Left a note after the sprint review — good progress, keep it up.', 'NOTE', DATE '2026-02-11'
FROM employees a, employees s
WHERE a.email = 'kirsten.human@psybergate.com' AND s.email = 'andile.zwane@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Left a note after the sprint review — good progress, keep it up.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-03-12'
FROM employees a, employees s
WHERE a.email = 'refilwe.monyane@psybergate.com' AND s.email = 'sarah.abrahams@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: reviewed recent work and agreed next steps.', 'MEETING', DATE '2026-04-13'
FROM employees a, employees s
WHERE a.email = 'puleng.seleka@psybergate.com' AND s.email = 'themba.nxumalo@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: reviewed recent work and agreed next steps.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: discussed goals, workload and growth areas.', 'MEETING', DATE '2026-05-14'
FROM employees a, employees s
WHERE a.email = 'werner.botha@psybergate.com' AND s.email = 'emily.roberts@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: discussed goals, workload and growth areas.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Called to catch up on current priorities and blockers.', 'CALL', DATE '2026-06-15'
FROM employees a, employees s
WHERE a.email = 'farah.ismail@psybergate.com' AND s.email = 'sizwe.khoza@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Called to catch up on current priorities and blockers.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Left a note after the sprint review — good progress, keep it up.', 'NOTE', DATE '2026-01-16'
FROM employees a, employees s
WHERE a.email = 'lerato.mahlangu@psybergate.com' AND s.email = 'deon.joubert@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Left a note after the sprint review — good progress, keep it up.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-02-17'
FROM employees a, employees s
WHERE a.email = 'naledi.mabaso@psybergate.com' AND s.email = 'refilwe.monyane@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: reviewed recent work and agreed next steps.', 'MEETING', DATE '2026-03-18'
FROM employees a, employees s
WHERE a.email = 'nokuthula.buthelezi@psybergate.com' AND s.email = 'grant.naicker@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: reviewed recent work and agreed next steps.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: discussed goals, workload and growth areas.', 'MEETING', DATE '2026-04-19'
FROM employees a, employees s
WHERE a.email = 'kirsten.human@psybergate.com' AND s.email = 'nonhlanhla.mkhize@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: discussed goals, workload and growth areas.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Called to catch up on current priorities and blockers.', 'CALL', DATE '2026-05-20'
FROM employees a, employees s
WHERE a.email = 'refilwe.monyane@psybergate.com' AND s.email = 'ahmed.suleiman@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Called to catch up on current priorities and blockers.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Left a note after the sprint review — good progress, keep it up.', 'NOTE', DATE '2026-06-21'
FROM employees a, employees s
WHERE a.email = 'puleng.seleka@psybergate.com' AND s.email = 'lindiwe.skosana@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Left a note after the sprint review — good progress, keep it up.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-01-22'
FROM employees a, employees s
WHERE a.email = 'werner.botha@psybergate.com' AND s.email = 'brandon.smit@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: reviewed recent work and agreed next steps.', 'MEETING', DATE '2026-02-23'
FROM employees a, employees s
WHERE a.email = 'farah.ismail@psybergate.com' AND s.email = 'yolanda.kunene@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: reviewed recent work and agreed next steps.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: discussed goals, workload and growth areas.', 'MEETING', DATE '2026-03-24'
FROM employees a, employees s
WHERE a.email = 'lerato.mahlangu@psybergate.com' AND s.email = 'trevor.adams@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: discussed goals, workload and growth areas.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Called to catch up on current priorities and blockers.', 'CALL', DATE '2026-04-25'
FROM employees a, employees s
WHERE a.email = 'naledi.mabaso@psybergate.com' AND s.email = 'puleng.seleka@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Called to catch up on current priorities and blockers.'
  );
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Left a note after the sprint review — good progress, keep it up.', 'NOTE', DATE '2026-05-26'
FROM employees a, employees s
WHERE a.email = 'nokuthula.buthelezi@psybergate.com' AND s.email = 'christopher.lee@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM interactions i
    WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Left a note after the sprint review — good progress, keep it up.'
  );

-- ---------------------------------------------------------------------------
-- Full-roster tasks: gives My Tasks and the profile task list something to
-- show for every employee (mixed OPEN/DONE, some assigned to a manager).
-- ---------------------------------------------------------------------------
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Complete quarterly self-review', NULL, 'DONE', r.id, c.id, a.id, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'werner.botha@psybergate.com'
JOIN employees a ON a.email = 'lerato.mahlangu@psybergate.com'
WHERE r.email = 'admin@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Complete quarterly self-review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Update skills profile', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-07', now(), now()
FROM employees r
JOIN employees c ON c.email = 'farah.ismail@psybergate.com'
WHERE r.email = 'jane.doe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Update skills profile'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-03-08', now(), now()
FROM employees r
JOIN employees c ON c.email = 'lerato.mahlangu@psybergate.com'
WHERE r.email = 'john.smith@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Finish onboarding checklist'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Prepare demo for the sprint review', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-04-09', now(), now()
FROM employees r
JOIN employees c ON c.email = 'naledi.mabaso@psybergate.com'
WHERE r.email = 'thabo.mokoena@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Prepare demo for the sprint review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Book annual performance conversation', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'nokuthula.buthelezi@psybergate.com'
WHERE r.email = 'amanda.pillay@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Book annual performance conversation'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Submit expense report', NULL, 'OPEN', r.id, c.id, a.id, DATE '2026-06-11', now(), now()
FROM employees r
JOIN employees c ON c.email = 'kirsten.human@psybergate.com'
JOIN employees a ON a.email = 'puleng.seleka@psybergate.com'
WHERE r.email = 'sipho.dlamini@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Submit expense report'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Review the latest team retro notes', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-01-12', now(), now()
FROM employees r
JOIN employees c ON c.email = 'refilwe.monyane@psybergate.com'
WHERE r.email = 'nomvula.khumalo@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Review the latest team retro notes'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Shadow a peer for cross-skilling', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-13', now(), now()
FROM employees r
JOIN employees c ON c.email = 'puleng.seleka@psybergate.com'
WHERE r.email = 'werner.botha@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Shadow a peer for cross-skilling'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Complete quarterly self-review', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'werner.botha@psybergate.com'
WHERE r.email = 'farah.ismail@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Complete quarterly self-review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Update skills profile', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-04-15', now(), now()
FROM employees r
JOIN employees c ON c.email = 'farah.ismail@psybergate.com'
WHERE r.email = 'liam.oconnor@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Update skills profile'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'OPEN', r.id, c.id, a.id, DATE '2026-05-16', now(), now()
FROM employees r
JOIN employees c ON c.email = 'lerato.mahlangu@psybergate.com'
JOIN employees a ON a.email = 'nokuthula.buthelezi@psybergate.com'
WHERE r.email = 'zanele.ndlovu@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Finish onboarding checklist'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Prepare demo for the sprint review', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-06-17', now(), now()
FROM employees r
JOIN employees c ON c.email = 'naledi.mabaso@psybergate.com'
WHERE r.email = 'rajesh.naidoo@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Prepare demo for the sprint review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Book annual performance conversation', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'nokuthula.buthelezi@psybergate.com'
WHERE r.email = 'chloe.vandermerwe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Book annual performance conversation'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Submit expense report', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-19', now(), now()
FROM employees r
JOIN employees c ON c.email = 'kirsten.human@psybergate.com'
WHERE r.email = 'mpho.sithole@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Submit expense report'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Review the latest team retro notes', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-03-20', now(), now()
FROM employees r
JOIN employees c ON c.email = 'refilwe.monyane@psybergate.com'
WHERE r.email = 'karabo.molefe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Review the latest team retro notes'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Shadow a peer for cross-skilling', NULL, 'OPEN', r.id, c.id, a.id, DATE '2026-04-21', now(), now()
FROM employees r
JOIN employees c ON c.email = 'puleng.seleka@psybergate.com'
JOIN employees a ON a.email = 'farah.ismail@psybergate.com'
WHERE r.email = 'lerato.mahlangu@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Shadow a peer for cross-skilling'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Complete quarterly self-review', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'werner.botha@psybergate.com'
WHERE r.email = 'david.chen@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Complete quarterly self-review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Update skills profile', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-06-23', now(), now()
FROM employees r
JOIN employees c ON c.email = 'farah.ismail@psybergate.com'
WHERE r.email = 'anele.zulu@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Update skills profile'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-01-24', now(), now()
FROM employees r
JOIN employees c ON c.email = 'lerato.mahlangu@psybergate.com'
WHERE r.email = 'michael.fourie@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Finish onboarding checklist'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Prepare demo for the sprint review', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-25', now(), now()
FROM employees r
JOIN employees c ON c.email = 'naledi.mabaso@psybergate.com'
WHERE r.email = 'precious.nkosi@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Prepare demo for the sprint review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Book annual performance conversation', NULL, 'DONE', r.id, c.id, a.id, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'nokuthula.buthelezi@psybergate.com'
JOIN employees a ON a.email = 'refilwe.monyane@psybergate.com'
WHERE r.email = 'thandiwe.cele@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Book annual performance conversation'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Submit expense report', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-04-27', now(), now()
FROM employees r
JOIN employees c ON c.email = 'kirsten.human@psybergate.com'
WHERE r.email = 'johan.pretorius@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Submit expense report'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Review the latest team retro notes', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-05-01', now(), now()
FROM employees r
JOIN employees c ON c.email = 'refilwe.monyane@psybergate.com'
WHERE r.email = 'naledi.mabaso@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Review the latest team retro notes'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Shadow a peer for cross-skilling', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-06-02', now(), now()
FROM employees r
JOIN employees c ON c.email = 'puleng.seleka@psybergate.com'
WHERE r.email = 'kevin.govender@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Shadow a peer for cross-skilling'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Complete quarterly self-review', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'werner.botha@psybergate.com'
WHERE r.email = 'bongani.mthembu@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Complete quarterly self-review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Update skills profile', NULL, 'OPEN', r.id, c.id, a.id, DATE '2026-02-04', now(), now()
FROM employees r
JOIN employees c ON c.email = 'farah.ismail@psybergate.com'
JOIN employees a ON a.email = 'naledi.mabaso@psybergate.com'
WHERE r.email = 'aisha.adams@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Update skills profile'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-03-05', now(), now()
FROM employees r
JOIN employees c ON c.email = 'lerato.mahlangu@psybergate.com'
WHERE r.email = 'pieter.steyn@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Finish onboarding checklist'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Prepare demo for the sprint review', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-04-06', now(), now()
FROM employees r
JOIN employees c ON c.email = 'naledi.mabaso@psybergate.com'
WHERE r.email = 'zola.gumede@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Prepare demo for the sprint review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Book annual performance conversation', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'nokuthula.buthelezi@psybergate.com'
WHERE r.email = 'fatima.patel@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Book annual performance conversation'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Submit expense report', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-06-08', now(), now()
FROM employees r
JOIN employees c ON c.email = 'kirsten.human@psybergate.com'
WHERE r.email = 'ryan.debeer@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Submit expense report'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Review the latest team retro notes', NULL, 'OPEN', r.id, c.id, a.id, DATE '2026-01-09', now(), now()
FROM employees r
JOIN employees c ON c.email = 'refilwe.monyane@psybergate.com'
JOIN employees a ON a.email = 'werner.botha@psybergate.com'
WHERE r.email = 'nokuthula.buthelezi@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Review the latest team retro notes'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Shadow a peer for cross-skilling', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-10', now(), now()
FROM employees r
JOIN employees c ON c.email = 'puleng.seleka@psybergate.com'
WHERE r.email = 'craig.williams@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Shadow a peer for cross-skilling'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Complete quarterly self-review', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'werner.botha@psybergate.com'
WHERE r.email = 'palesa.tshabalala@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Complete quarterly self-review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Update skills profile', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-04-12', now(), now()
FROM employees r
JOIN employees c ON c.email = 'farah.ismail@psybergate.com'
WHERE r.email = 'samuel.osei@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Update skills profile'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-05-13', now(), now()
FROM employees r
JOIN employees c ON c.email = 'lerato.mahlangu@psybergate.com'
WHERE r.email = 'bianca.marais@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Finish onboarding checklist'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Prepare demo for the sprint review', NULL, 'OPEN', r.id, c.id, a.id, DATE '2026-06-14', now(), now()
FROM employees r
JOIN employees c ON c.email = 'naledi.mabaso@psybergate.com'
JOIN employees a ON a.email = 'kirsten.human@psybergate.com'
WHERE r.email = 'vusi.radebe@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Prepare demo for the sprint review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Book annual performance conversation', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'nokuthula.buthelezi@psybergate.com'
WHERE r.email = 'kirsten.human@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Book annual performance conversation'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Submit expense report', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-16', now(), now()
FROM employees r
JOIN employees c ON c.email = 'kirsten.human@psybergate.com'
WHERE r.email = 'andile.zwane@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Submit expense report'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Review the latest team retro notes', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-03-17', now(), now()
FROM employees r
JOIN employees c ON c.email = 'refilwe.monyane@psybergate.com'
WHERE r.email = 'sarah.abrahams@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Review the latest team retro notes'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Shadow a peer for cross-skilling', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-04-18', now(), now()
FROM employees r
JOIN employees c ON c.email = 'puleng.seleka@psybergate.com'
WHERE r.email = 'themba.nxumalo@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Shadow a peer for cross-skilling'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Complete quarterly self-review', NULL, 'DONE', r.id, c.id, a.id, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'werner.botha@psybergate.com'
JOIN employees a ON a.email = 'lerato.mahlangu@psybergate.com'
WHERE r.email = 'emily.roberts@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Complete quarterly self-review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Update skills profile', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-06-20', now(), now()
FROM employees r
JOIN employees c ON c.email = 'farah.ismail@psybergate.com'
WHERE r.email = 'sizwe.khoza@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Update skills profile'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-01-21', now(), now()
FROM employees r
JOIN employees c ON c.email = 'lerato.mahlangu@psybergate.com'
WHERE r.email = 'deon.joubert@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Finish onboarding checklist'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Prepare demo for the sprint review', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-22', now(), now()
FROM employees r
JOIN employees c ON c.email = 'naledi.mabaso@psybergate.com'
WHERE r.email = 'refilwe.monyane@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Prepare demo for the sprint review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Book annual performance conversation', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'nokuthula.buthelezi@psybergate.com'
WHERE r.email = 'grant.naicker@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Book annual performance conversation'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Submit expense report', NULL, 'OPEN', r.id, c.id, a.id, DATE '2026-04-24', now(), now()
FROM employees r
JOIN employees c ON c.email = 'kirsten.human@psybergate.com'
JOIN employees a ON a.email = 'puleng.seleka@psybergate.com'
WHERE r.email = 'nonhlanhla.mkhize@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Submit expense report'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Review the latest team retro notes', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-05-25', now(), now()
FROM employees r
JOIN employees c ON c.email = 'refilwe.monyane@psybergate.com'
WHERE r.email = 'ahmed.suleiman@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Review the latest team retro notes'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Shadow a peer for cross-skilling', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-06-26', now(), now()
FROM employees r
JOIN employees c ON c.email = 'puleng.seleka@psybergate.com'
WHERE r.email = 'lindiwe.skosana@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Shadow a peer for cross-skilling'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Complete quarterly self-review', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'werner.botha@psybergate.com'
WHERE r.email = 'brandon.smit@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Complete quarterly self-review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Update skills profile', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-01', now(), now()
FROM employees r
JOIN employees c ON c.email = 'farah.ismail@psybergate.com'
WHERE r.email = 'yolanda.kunene@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Update skills profile'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'OPEN', r.id, c.id, a.id, DATE '2026-03-02', now(), now()
FROM employees r
JOIN employees c ON c.email = 'lerato.mahlangu@psybergate.com'
JOIN employees a ON a.email = 'nokuthula.buthelezi@psybergate.com'
WHERE r.email = 'trevor.adams@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Finish onboarding checklist'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Prepare demo for the sprint review', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-04-03', now(), now()
FROM employees r
JOIN employees c ON c.email = 'naledi.mabaso@psybergate.com'
WHERE r.email = 'puleng.seleka@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Prepare demo for the sprint review'
  );
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Book annual performance conversation', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'nokuthula.buthelezi@psybergate.com'
WHERE r.email = 'christopher.lee@psybergate.com'
  AND NOT EXISTS (
    SELECT 1 FROM tasks t WHERE t.relates_to_id = r.id AND t.title = 'Book annual performance conversation'
  );
