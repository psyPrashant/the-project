-- =============================================================================
-- Seed data for The Staff Project (dev + Testcontainers/CI).
--
-- Structure:
--   * admin + a handful of manager / HR roles are the login-capable users
--     (password "password123"); they are the people who actually drive the
--     system for now.
--   * 20 employees have full profiles but no login credentials.
--   * Everyone has skills, a project, an education entry and showcase links;
--     managers log interactions and tasks against their reports.
--
-- Runs on every startup (spring.sql.init.mode=always), so every statement is
-- idempotent (ON CONFLICT / NOT EXISTS guards).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Login-capable users (admin + managers / HR). BCrypt hash of "password123".
-- ---------------------------------------------------------------------------
INSERT INTO employees (first_name, last_name, email, password_hash, job_title, department, phone, archived) VALUES
  ('Admin', 'User', 'admin@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'System Administrator', 'Operations', '+27 82 000 0001', false),
  ('Jane', 'Doe', 'jane.doe@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Engineering Manager', 'Engineering', '+27 82 000 0002', false),
  ('John', 'Smith', 'john.smith@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'HR Manager', 'People', '+27 82 000 0003', false),
  ('Nomsa', 'Khumalo', 'nomsa.khumalo@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'People Partner', 'People', '+27 82 000 0004', false),
  ('Daniel', 'van der Merwe', 'daniel.vandermerwe@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Product Manager', 'Product', '+27 82 000 0005', false),
  ('Thabo', 'Molefe', 'thabo.molefe@psybergate.com', '$2a$10$nUQ8QnluvSnpFjcrk2phKOCXAjztNz5MQgxHySmQSFs/qyxXdlLju', 'Engineering Team Lead', 'Engineering', '+27 82 000 0006', false)
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Employees (no login credentials — password_hash is NULL).
-- ---------------------------------------------------------------------------
INSERT INTO employees (first_name, last_name, email, password_hash, job_title, department, phone, archived) VALUES
  ('Sipho', 'Dlamini', 'sipho.dlamini@psybergate.com', NULL, 'Senior Backend Engineer', 'Engineering', '+27 83 100 1000', false),
  ('Aisha', 'Patel', 'aisha.patel@psybergate.com', NULL, 'Backend Engineer', 'Engineering', '+27 83 100 1001', false),
  ('Liam', 'Botha', 'liam.botha@psybergate.com', NULL, 'Frontend Engineer', 'Engineering', '+27 83 100 1002', false),
  ('Zanele', 'Nkosi', 'zanele.nkosi@psybergate.com', NULL, 'Frontend Engineer', 'Engineering', '+27 83 100 1003', false),
  ('Kagiso', 'Mahlangu', 'kagiso.mahlangu@psybergate.com', NULL, 'Full Stack Engineer', 'Engineering', '+27 83 100 1004', false),
  ('Ryan', 'Naidoo', 'ryan.naidoo@psybergate.com', NULL, 'Full Stack Engineer', 'Engineering', '+27 83 100 1005', false),
  ('Lerato', 'Mokwena', 'lerato.mokwena@psybergate.com', NULL, 'QA Engineer', 'Engineering', '+27 83 100 1006', false),
  ('Pieter', 'Steyn', 'pieter.steyn@psybergate.com', NULL, 'QA Engineer', 'Engineering', '+27 83 100 1007', true),
  ('Bongani', 'Zulu', 'bongani.zulu@psybergate.com', NULL, 'DevOps Engineer', 'Platform', '+27 83 100 1008', false),
  ('Chloe', 'van Wyk', 'chloe.vanwyk@psybergate.com', NULL, 'Site Reliability Engineer', 'Platform', '+27 83 100 1009', false),
  ('Farai', 'Moyo', 'farai.moyo@psybergate.com', NULL, 'Security Engineer', 'Platform', '+27 83 100 1010', false),
  ('Rajesh', 'Reddy', 'rajesh.reddy@psybergate.com', NULL, 'Data Engineer', 'Data', '+27 83 100 1011', false),
  ('Naledi', 'Mokoena', 'naledi.mokoena@psybergate.com', NULL, 'Data Analyst', 'Data', '+27 83 100 1012', false),
  ('Sarah', 'Abrahams', 'sarah.abrahams@psybergate.com', NULL, 'Data Analyst', 'Data', '+27 83 100 1013', false),
  ('Themba', 'Sithole', 'themba.sithole@psybergate.com', NULL, 'UX Designer', 'Design', '+27 83 100 1014', false),
  ('Emily', 'Roberts', 'emily.roberts@psybergate.com', NULL, 'UI Designer', 'Design', '+27 83 100 1015', false),
  ('Karabo', 'Sithole', 'karabo.sithole@psybergate.com', NULL, 'Business Analyst', 'Product', '+27 83 100 1016', false),
  ('Vusi', 'Radebe', 'vusi.radebe@psybergate.com', NULL, 'Scrum Master', 'Engineering', '+27 83 100 1017', false),
  ('Amara', 'Okafor', 'amara.okafor@psybergate.com', NULL, 'Recruiter', 'People', '+27 83 100 1018', false),
  ('Michael', 'Fourie', 'michael.fourie@psybergate.com', NULL, 'Support Engineer', 'Support', '+27 83 100 1019', true)
ON CONFLICT (email) DO NOTHING;

-- Backfill archived=false for any legacy rows added before the column existed.
UPDATE employees SET archived = false WHERE archived IS NULL;

-- ---------------------------------------------------------------------------
-- Canonical skills (deduplicated reference entities, D5).
-- ---------------------------------------------------------------------------
INSERT INTO skill (name) SELECT 'AWS' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'aws');
INSERT INTO skill (name) SELECT 'Agile Coaching' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'agile coaching');
INSERT INTO skill (name) SELECT 'Angular' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'angular');
INSERT INTO skill (name) SELECT 'Customer Support' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'customer support');
INSERT INTO skill (name) SELECT 'Data Modeling' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'data modeling');
INSERT INTO skill (name) SELECT 'Docker' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'docker');
INSERT INTO skill (name) SELECT 'Employee Relations' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'employee relations');
INSERT INTO skill (name) SELECT 'Employer Branding' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'employer branding');
INSERT INTO skill (name) SELECT 'Figma' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'figma');
INSERT INTO skill (name) SELECT 'Git' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'git');
INSERT INTO skill (name) SELECT 'Java' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'java');
INSERT INTO skill (name) SELECT 'Kubernetes' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'kubernetes');
INSERT INTO skill (name) SELECT 'People Management' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'people management');
INSERT INTO skill (name) SELECT 'Playwright' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'playwright');
INSERT INTO skill (name) SELECT 'Product Strategy' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'product strategy');
INSERT INTO skill (name) SELECT 'Python' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'python');
INSERT INTO skill (name) SELECT 'React' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'react');
INSERT INTO skill (name) SELECT 'Recruiting' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'recruiting');
INSERT INTO skill (name) SELECT 'Requirements Analysis' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'requirements analysis');
INSERT INTO skill (name) SELECT 'SQL' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'sql');
INSERT INTO skill (name) SELECT 'Spring Boot' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'spring boot');
INSERT INTO skill (name) SELECT 'Terraform' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'terraform');
INSERT INTO skill (name) SELECT 'TypeScript' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'typescript');
INSERT INTO skill (name) SELECT 'UX Research' WHERE NOT EXISTS (SELECT 1 FROM skill WHERE LOWER(name) = 'ux research');

-- ---------------------------------------------------------------------------
-- Employee-skill links (years of experience per person).
-- ---------------------------------------------------------------------------
INSERT INTO employee_skill (employee_id, skill_id, years)
SELECT e.id, s.id, v.years
FROM (VALUES
  ('admin@psybergate.com', 'Docker', 5),
  ('admin@psybergate.com', 'AWS', 5),
  ('admin@psybergate.com', 'SQL', 4),
  ('jane.doe@psybergate.com', 'Java', 9),
  ('jane.doe@psybergate.com', 'People Management', 6),
  ('jane.doe@psybergate.com', 'AWS', 4),
  ('john.smith@psybergate.com', 'People Management', 8),
  ('john.smith@psybergate.com', 'Recruiting', 6),
  ('nomsa.khumalo@psybergate.com', 'Employee Relations', 5),
  ('nomsa.khumalo@psybergate.com', 'Recruiting', 4),
  ('daniel.vandermerwe@psybergate.com', 'Product Strategy', 6),
  ('daniel.vandermerwe@psybergate.com', 'SQL', 3),
  ('daniel.vandermerwe@psybergate.com', 'UX Research', 3),
  ('thabo.molefe@psybergate.com', 'Java', 7),
  ('thabo.molefe@psybergate.com', 'Spring Boot', 6),
  ('thabo.molefe@psybergate.com', 'People Management', 3),
  ('sipho.dlamini@psybergate.com', 'Java', 6),
  ('sipho.dlamini@psybergate.com', 'Spring Boot', 5),
  ('sipho.dlamini@psybergate.com', 'SQL', 6),
  ('sipho.dlamini@psybergate.com', 'Docker', 3),
  ('aisha.patel@psybergate.com', 'Java', 6),
  ('aisha.patel@psybergate.com', 'Spring Boot', 5),
  ('aisha.patel@psybergate.com', 'SQL', 6),
  ('aisha.patel@psybergate.com', 'Docker', 3),
  ('liam.botha@psybergate.com', 'Angular', 4),
  ('liam.botha@psybergate.com', 'TypeScript', 4),
  ('liam.botha@psybergate.com', 'React', 2),
  ('liam.botha@psybergate.com', 'Git', 5),
  ('zanele.nkosi@psybergate.com', 'Angular', 4),
  ('zanele.nkosi@psybergate.com', 'TypeScript', 4),
  ('zanele.nkosi@psybergate.com', 'React', 2),
  ('zanele.nkosi@psybergate.com', 'Git', 5),
  ('kagiso.mahlangu@psybergate.com', 'Angular', 4),
  ('kagiso.mahlangu@psybergate.com', 'Java', 4),
  ('kagiso.mahlangu@psybergate.com', 'Spring Boot', 3),
  ('kagiso.mahlangu@psybergate.com', 'TypeScript', 4),
  ('kagiso.mahlangu@psybergate.com', 'SQL', 4),
  ('ryan.naidoo@psybergate.com', 'Angular', 4),
  ('ryan.naidoo@psybergate.com', 'Java', 4),
  ('ryan.naidoo@psybergate.com', 'Spring Boot', 3),
  ('ryan.naidoo@psybergate.com', 'TypeScript', 4),
  ('ryan.naidoo@psybergate.com', 'SQL', 4),
  ('lerato.mokwena@psybergate.com', 'SQL', 3),
  ('lerato.mokwena@psybergate.com', 'Playwright', 2),
  ('lerato.mokwena@psybergate.com', 'Docker', 2),
  ('pieter.steyn@psybergate.com', 'SQL', 3),
  ('pieter.steyn@psybergate.com', 'Playwright', 2),
  ('pieter.steyn@psybergate.com', 'Docker', 2),
  ('bongani.zulu@psybergate.com', 'Docker', 5),
  ('bongani.zulu@psybergate.com', 'Kubernetes', 4),
  ('bongani.zulu@psybergate.com', 'Terraform', 3),
  ('bongani.zulu@psybergate.com', 'AWS', 4),
  ('chloe.vanwyk@psybergate.com', 'Kubernetes', 4),
  ('chloe.vanwyk@psybergate.com', 'AWS', 5),
  ('chloe.vanwyk@psybergate.com', 'Terraform', 3),
  ('chloe.vanwyk@psybergate.com', 'Python', 3),
  ('farai.moyo@psybergate.com', 'Docker', 3),
  ('farai.moyo@psybergate.com', 'AWS', 3),
  ('farai.moyo@psybergate.com', 'Python', 4),
  ('rajesh.reddy@psybergate.com', 'Python', 6),
  ('rajesh.reddy@psybergate.com', 'SQL', 7),
  ('rajesh.reddy@psybergate.com', 'AWS', 4),
  ('naledi.mokoena@psybergate.com', 'SQL', 5),
  ('naledi.mokoena@psybergate.com', 'Python', 3),
  ('naledi.mokoena@psybergate.com', 'Data Modeling', 3),
  ('sarah.abrahams@psybergate.com', 'SQL', 5),
  ('sarah.abrahams@psybergate.com', 'Python', 3),
  ('sarah.abrahams@psybergate.com', 'Data Modeling', 3),
  ('themba.sithole@psybergate.com', 'Figma', 6),
  ('themba.sithole@psybergate.com', 'UX Research', 4),
  ('emily.roberts@psybergate.com', 'Figma', 5),
  ('emily.roberts@psybergate.com', 'React', 2),
  ('karabo.sithole@psybergate.com', 'SQL', 3),
  ('karabo.sithole@psybergate.com', 'Requirements Analysis', 5),
  ('vusi.radebe@psybergate.com', 'Agile Coaching', 5),
  ('amara.okafor@psybergate.com', 'Recruiting', 5),
  ('amara.okafor@psybergate.com', 'Employer Branding', 3),
  ('michael.fourie@psybergate.com', 'Customer Support', 4),
  ('michael.fourie@psybergate.com', 'SQL', 2)
) AS v(email, skill_name, years)
JOIN employees e ON e.email = v.email
JOIN skill s ON LOWER(s.name) = LOWER(v.skill_name)
WHERE NOT EXISTS (SELECT 1 FROM employee_skill es WHERE es.employee_id = e.id AND es.skill_id = s.id);

-- ---------------------------------------------------------------------------
-- Portfolio projects (one showcase project each).
-- ---------------------------------------------------------------------------
INSERT INTO portfolio_projects (employee_id, name, description, start_date, end_date, url)
SELECT e.id, v.name, v.description, v.start_date, v.end_date, NULL
FROM (VALUES
  ('admin@psybergate.com', 'Infrastructure Baseline', 'Established the baseline cloud and CI infrastructure.', DATE '2025-01-01', NULL),
  ('jane.doe@psybergate.com', 'Platform Delivery FY26', 'Owned engineering delivery across the platform for the year.', DATE '2025-02-01', DATE '2025-06-28'),
  ('john.smith@psybergate.com', 'People Operations Revamp', 'Overhauled the core people-operations processes.', DATE '2025-03-01', DATE '2025-07-28'),
  ('nomsa.khumalo@psybergate.com', 'Engagement Survey 2026', 'Ran the company-wide engagement survey and follow-ups.', DATE '2025-04-01', NULL),
  ('daniel.vandermerwe@psybergate.com', 'Engagement Platform Roadmap', 'Owned the roadmap for the staff-engagement platform.', DATE '2025-05-01', DATE '2025-09-28'),
  ('thabo.molefe@psybergate.com', 'Skills Register Delivery', 'Led delivery of the skills-register epic.', DATE '2025-06-01', DATE '2025-10-28'),
  ('sipho.dlamini@psybergate.com', 'Payments Service Rebuild', 'Re-platformed the payments service onto Spring Boot.', DATE '2025-07-01', NULL),
  ('aisha.patel@psybergate.com', 'Payments Service Rebuild', 'Re-platformed the payments service onto Spring Boot.', DATE '2025-08-01', DATE '2025-12-28'),
  ('liam.botha@psybergate.com', 'Customer Portal Redesign', 'Rebuilt the customer portal in Angular.', DATE '2025-09-01', DATE '2025-12-28'),
  ('zanele.nkosi@psybergate.com', 'Customer Portal Redesign', 'Rebuilt the customer portal in Angular.', DATE '2025-01-01', NULL),
  ('kagiso.mahlangu@psybergate.com', 'Self-Service Portal', 'Delivered the employee self-service portal end to end.', DATE '2025-02-01', DATE '2025-06-28'),
  ('ryan.naidoo@psybergate.com', 'Self-Service Portal', 'Delivered the employee self-service portal end to end.', DATE '2025-03-01', DATE '2025-07-28'),
  ('lerato.mokwena@psybergate.com', 'Regression Automation Suite', 'Automated the end-to-end regression suite in Playwright.', DATE '2025-04-01', NULL),
  ('pieter.steyn@psybergate.com', 'Regression Automation Suite', 'Automated the end-to-end regression suite in Playwright.', DATE '2025-05-01', DATE '2025-09-28'),
  ('bongani.zulu@psybergate.com', 'CI/CD Modernisation', 'Migrated the build and deploy pipeline to containers.', DATE '2025-06-01', DATE '2025-10-28'),
  ('chloe.vanwyk@psybergate.com', 'Observability Overhaul', 'Rebuilt the metrics and alerting stack, halving MTTR.', DATE '2025-07-01', NULL),
  ('farai.moyo@psybergate.com', 'Security Hardening Programme', 'Closed out the annual penetration-test findings.', DATE '2025-08-01', DATE '2025-12-28'),
  ('rajesh.reddy@psybergate.com', 'Analytics Warehouse', 'Built the ingestion pipeline feeding the reporting warehouse.', DATE '2025-09-01', DATE '2025-12-28'),
  ('naledi.mokoena@psybergate.com', 'Engagement Dashboard', 'Published the staff-engagement reporting dashboard.', DATE '2025-01-01', NULL),
  ('sarah.abrahams@psybergate.com', 'Engagement Dashboard', 'Published the staff-engagement reporting dashboard.', DATE '2025-02-01', DATE '2025-06-28'),
  ('themba.sithole@psybergate.com', 'Onboarding Experience', 'Redesigned the onboarding journey after user research.', DATE '2025-03-01', DATE '2025-07-28'),
  ('emily.roberts@psybergate.com', 'Design System Rollout', 'Shipped the shared component library.', DATE '2025-04-01', NULL),
  ('karabo.sithole@psybergate.com', 'Tasks Module Delivery', 'Gathered and signed off requirements for the tasks module.', DATE '2025-05-01', DATE '2025-09-28'),
  ('vusi.radebe@psybergate.com', 'Agile Transformation', 'Coached two squads through an agile transformation.', DATE '2025-06-01', DATE '2025-10-28'),
  ('amara.okafor@psybergate.com', 'Graduate Hiring Drive', 'Ran the annual graduate recruitment campaign.', DATE '2025-07-01', NULL),
  ('michael.fourie@psybergate.com', 'Support Triage Overhaul', 'Reduced ticket backlog by reworking triage.', DATE '2025-08-01', DATE '2025-12-28')
) AS v(email, name, description, start_date, end_date)
JOIN employees e ON e.email = v.email
WHERE NOT EXISTS (SELECT 1 FROM portfolio_projects pp WHERE pp.employee_id = e.id AND pp.name = v.name);

-- ---------------------------------------------------------------------------
-- Portfolio education (one qualification each).
-- ---------------------------------------------------------------------------
INSERT INTO portfolio_education (employee_id, institution, qualification, field_of_study, start_year, end_year, description)
SELECT e.id, v.institution, v.qualification, v.field_of_study, v.start_year, v.end_year, NULL
FROM (VALUES
  ('admin@psybergate.com', 'University of Cape Town', 'BSc Computer Science', 'Software Engineering', 2007, 2010),
  ('jane.doe@psybergate.com', 'University of the Witwatersrand', 'BSc Computer Science', 'Software Engineering', 2008, 2011),
  ('john.smith@psybergate.com', 'Stellenbosch University', 'BSc Computer Science', 'Software Engineering', 2009, 2012),
  ('nomsa.khumalo@psybergate.com', 'University of Pretoria', 'BSc Computer Science', 'Software Engineering', 2010, 2013),
  ('daniel.vandermerwe@psybergate.com', 'University of KwaZulu-Natal', 'BSc Computer Science', 'Software Engineering', 2011, 2014),
  ('thabo.molefe@psybergate.com', 'Rhodes University', 'BSc Computer Science', 'Software Engineering', 2012, 2015),
  ('sipho.dlamini@psybergate.com', 'Nelson Mandela University', 'BSc Computer Science', 'Software Engineering', 2013, 2016),
  ('aisha.patel@psybergate.com', 'University of Johannesburg', 'BSc Computer Science', 'Software Engineering', 2014, 2017),
  ('liam.botha@psybergate.com', 'North-West University', 'BSc Information Systems', 'Web Development', 2015, 2018),
  ('zanele.nkosi@psybergate.com', 'University of Cape Town', 'BSc Information Systems', 'Web Development', 2016, 2019),
  ('kagiso.mahlangu@psybergate.com', 'University of the Witwatersrand', 'BSc Computer Science', 'Software Engineering', 2017, 2020),
  ('ryan.naidoo@psybergate.com', 'Stellenbosch University', 'BSc Computer Science', 'Software Engineering', 2018, 2021),
  ('lerato.mokwena@psybergate.com', 'University of Pretoria', 'BSc Computer Science', 'Quality Engineering', 2019, 2022),
  ('pieter.steyn@psybergate.com', 'University of KwaZulu-Natal', 'BSc Computer Science', 'Quality Engineering', 2007, 2010),
  ('bongani.zulu@psybergate.com', 'Rhodes University', 'BEng Electronic Engineering', 'Systems Engineering', 2008, 2011),
  ('chloe.vanwyk@psybergate.com', 'Nelson Mandela University', 'BSc Computer Science', 'Systems Engineering', 2009, 2012),
  ('farai.moyo@psybergate.com', 'University of Johannesburg', 'BSc Computer Science', 'Information Security', 2010, 2013),
  ('rajesh.reddy@psybergate.com', 'North-West University', 'BSc Computer Science', 'Data Engineering', 2011, 2014),
  ('naledi.mokoena@psybergate.com', 'University of Cape Town', 'BSc Statistics', 'Data Science', 2012, 2015),
  ('sarah.abrahams@psybergate.com', 'University of the Witwatersrand', 'BSc Statistics', 'Data Science', 2013, 2016),
  ('themba.sithole@psybergate.com', 'Stellenbosch University', 'BA Design', 'Interaction Design', 2014, 2017),
  ('emily.roberts@psybergate.com', 'University of Pretoria', 'BA Visual Communication', 'Digital Design', 2015, 2018),
  ('karabo.sithole@psybergate.com', 'University of KwaZulu-Natal', 'BCom Informatics', 'Business Analysis', 2016, 2019),
  ('vusi.radebe@psybergate.com', 'Rhodes University', 'BCom Business Management', 'Organisational Psychology', 2017, 2020),
  ('amara.okafor@psybergate.com', 'Nelson Mandela University', 'BA Human Resource Management', 'People Management', 2018, 2021),
  ('michael.fourie@psybergate.com', 'University of Johannesburg', 'BSc Information Technology', 'Computer Science', 2019, 2022)
) AS v(email, institution, qualification, field_of_study, start_year, end_year)
JOIN employees e ON e.email = v.email
WHERE NOT EXISTS (SELECT 1 FROM portfolio_education pe WHERE pe.employee_id = e.id AND pe.institution = v.institution AND pe.qualification = v.qualification);

-- ---------------------------------------------------------------------------
-- Showcase links (LinkedIn for everyone, GitHub for technical roles).
-- ---------------------------------------------------------------------------
INSERT INTO portfolio_links (employee_id, label, url, sort_order)
SELECT e.id, v.label, v.url, v.sort_order
FROM (VALUES
  ('admin@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/admin-user', 1),
  ('admin@psybergate.com', 'GitHub', 'https://github.com/adminuser', 2),
  ('jane.doe@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/jane-doe', 1),
  ('jane.doe@psybergate.com', 'GitHub', 'https://github.com/janedoe', 2),
  ('john.smith@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/john-smith', 1),
  ('nomsa.khumalo@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/nomsa-khumalo', 1),
  ('daniel.vandermerwe@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/daniel-vandermerwe', 1),
  ('daniel.vandermerwe@psybergate.com', 'GitHub', 'https://github.com/danielvandermerwe', 2),
  ('thabo.molefe@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/thabo-molefe', 1),
  ('thabo.molefe@psybergate.com', 'GitHub', 'https://github.com/thabomolefe', 2),
  ('sipho.dlamini@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/sipho-dlamini', 1),
  ('sipho.dlamini@psybergate.com', 'GitHub', 'https://github.com/siphodlamini', 2),
  ('aisha.patel@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/aisha-patel', 1),
  ('aisha.patel@psybergate.com', 'GitHub', 'https://github.com/aishapatel', 2),
  ('liam.botha@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/liam-botha', 1),
  ('liam.botha@psybergate.com', 'GitHub', 'https://github.com/liambotha', 2),
  ('zanele.nkosi@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/zanele-nkosi', 1),
  ('zanele.nkosi@psybergate.com', 'GitHub', 'https://github.com/zanelenkosi', 2),
  ('kagiso.mahlangu@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/kagiso-mahlangu', 1),
  ('kagiso.mahlangu@psybergate.com', 'GitHub', 'https://github.com/kagisomahlangu', 2),
  ('ryan.naidoo@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/ryan-naidoo', 1),
  ('ryan.naidoo@psybergate.com', 'GitHub', 'https://github.com/ryannaidoo', 2),
  ('lerato.mokwena@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/lerato-mokwena', 1),
  ('lerato.mokwena@psybergate.com', 'GitHub', 'https://github.com/leratomokwena', 2),
  ('pieter.steyn@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/pieter-steyn', 1),
  ('pieter.steyn@psybergate.com', 'GitHub', 'https://github.com/pietersteyn', 2),
  ('bongani.zulu@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/bongani-zulu', 1),
  ('bongani.zulu@psybergate.com', 'GitHub', 'https://github.com/bonganizulu', 2),
  ('chloe.vanwyk@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/chloe-vanwyk', 1),
  ('chloe.vanwyk@psybergate.com', 'GitHub', 'https://github.com/chloevanwyk', 2),
  ('farai.moyo@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/farai-moyo', 1),
  ('farai.moyo@psybergate.com', 'GitHub', 'https://github.com/faraimoyo', 2),
  ('rajesh.reddy@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/rajesh-reddy', 1),
  ('rajesh.reddy@psybergate.com', 'GitHub', 'https://github.com/rajeshreddy', 2),
  ('naledi.mokoena@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/naledi-mokoena', 1),
  ('naledi.mokoena@psybergate.com', 'GitHub', 'https://github.com/naledimokoena', 2),
  ('sarah.abrahams@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/sarah-abrahams', 1),
  ('sarah.abrahams@psybergate.com', 'GitHub', 'https://github.com/sarahabrahams', 2),
  ('themba.sithole@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/themba-sithole', 1),
  ('themba.sithole@psybergate.com', 'GitHub', 'https://github.com/thembasithole', 2),
  ('emily.roberts@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/emily-roberts', 1),
  ('emily.roberts@psybergate.com', 'GitHub', 'https://github.com/emilyroberts', 2),
  ('karabo.sithole@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/karabo-sithole', 1),
  ('vusi.radebe@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/vusi-radebe', 1),
  ('amara.okafor@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/amara-okafor', 1),
  ('michael.fourie@psybergate.com', 'LinkedIn', 'https://www.linkedin.com/in/michael-fourie', 1)
) AS v(email, label, url, sort_order)
JOIN employees e ON e.email = v.email
WHERE NOT EXISTS (SELECT 1 FROM portfolio_links pl WHERE pl.employee_id = e.id AND pl.label = v.label);

-- ---------------------------------------------------------------------------
-- Skill-to-project links (drives non-zero projectCount in the Skills Register).
-- ---------------------------------------------------------------------------
INSERT INTO employee_skill_project (employee_skill_id, project_id)
SELECT es.id, pp.id
FROM (VALUES
  ('admin@psybergate.com', 'Docker', 'Infrastructure Baseline'),
  ('jane.doe@psybergate.com', 'Java', 'Platform Delivery FY26'),
  ('john.smith@psybergate.com', 'People Management', 'People Operations Revamp'),
  ('nomsa.khumalo@psybergate.com', 'Employee Relations', 'Engagement Survey 2026'),
  ('daniel.vandermerwe@psybergate.com', 'Product Strategy', 'Engagement Platform Roadmap'),
  ('thabo.molefe@psybergate.com', 'Java', 'Skills Register Delivery'),
  ('sipho.dlamini@psybergate.com', 'Java', 'Payments Service Rebuild'),
  ('aisha.patel@psybergate.com', 'Java', 'Payments Service Rebuild'),
  ('liam.botha@psybergate.com', 'Angular', 'Customer Portal Redesign'),
  ('zanele.nkosi@psybergate.com', 'Angular', 'Customer Portal Redesign'),
  ('kagiso.mahlangu@psybergate.com', 'Angular', 'Self-Service Portal'),
  ('ryan.naidoo@psybergate.com', 'Angular', 'Self-Service Portal'),
  ('lerato.mokwena@psybergate.com', 'SQL', 'Regression Automation Suite'),
  ('pieter.steyn@psybergate.com', 'SQL', 'Regression Automation Suite'),
  ('bongani.zulu@psybergate.com', 'Docker', 'CI/CD Modernisation'),
  ('chloe.vanwyk@psybergate.com', 'Kubernetes', 'Observability Overhaul'),
  ('farai.moyo@psybergate.com', 'Docker', 'Security Hardening Programme'),
  ('rajesh.reddy@psybergate.com', 'Python', 'Analytics Warehouse'),
  ('naledi.mokoena@psybergate.com', 'SQL', 'Engagement Dashboard'),
  ('sarah.abrahams@psybergate.com', 'SQL', 'Engagement Dashboard'),
  ('themba.sithole@psybergate.com', 'Figma', 'Onboarding Experience'),
  ('emily.roberts@psybergate.com', 'Figma', 'Design System Rollout'),
  ('karabo.sithole@psybergate.com', 'SQL', 'Tasks Module Delivery'),
  ('vusi.radebe@psybergate.com', 'Agile Coaching', 'Agile Transformation'),
  ('amara.okafor@psybergate.com', 'Recruiting', 'Graduate Hiring Drive'),
  ('michael.fourie@psybergate.com', 'Customer Support', 'Support Triage Overhaul')
) AS v(email, skill_name, project_name)
JOIN employees e ON e.email = v.email
JOIN skill s ON LOWER(s.name) = LOWER(v.skill_name)
JOIN employee_skill es ON es.employee_id = e.id AND es.skill_id = s.id
JOIN portfolio_projects pp ON pp.employee_id = e.id AND pp.name = v.project_name
WHERE NOT EXISTS (SELECT 1 FROM employee_skill_project esp WHERE esp.employee_skill_id = es.id AND esp.project_id = pp.id);

-- ---------------------------------------------------------------------------
-- Interactions (managers logging against their reports and each other).
-- ---------------------------------------------------------------------------
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: reviewed goals, workload and growth areas.', 'MEETING', DATE '2026-01-02'
FROM employees a, employees s
WHERE a.email = 'thabo.molefe@psybergate.com' AND s.email = 'sipho.dlamini@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: reviewed goals, workload and growth areas.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quick call to unblock the current piece of work.', 'CALL', DATE '2026-03-04'
FROM employees a, employees s
WHERE a.email = 'thabo.molefe@psybergate.com' AND s.email = 'sipho.dlamini@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quick call to unblock the current piece of work.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Sprint review notes: solid delivery this cycle, keep the momentum.', 'NOTE', DATE '2026-02-03'
FROM employees a, employees s
WHERE a.email = 'thabo.molefe@psybergate.com' AND s.email = 'aisha.patel@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Sprint review notes: solid delivery this cycle, keep the momentum.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-04-05'
FROM employees a, employees s
WHERE a.email = 'thabo.molefe@psybergate.com' AND s.email = 'aisha.patel@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quick call to unblock the current piece of work.', 'CALL', DATE '2026-03-04'
FROM employees a, employees s
WHERE a.email = 'thabo.molefe@psybergate.com' AND s.email = 'liam.botha@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quick call to unblock the current piece of work.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: discussed recent work and agreed next steps.', 'MEETING', DATE '2026-05-06'
FROM employees a, employees s
WHERE a.email = 'thabo.molefe@psybergate.com' AND s.email = 'liam.botha@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: discussed recent work and agreed next steps.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-04-05'
FROM employees a, employees s
WHERE a.email = 'thabo.molefe@psybergate.com' AND s.email = 'zanele.nkosi@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: reviewed goals, workload and growth areas.', 'MEETING', DATE '2026-01-07'
FROM employees a, employees s
WHERE a.email = 'thabo.molefe@psybergate.com' AND s.email = 'zanele.nkosi@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: reviewed goals, workload and growth areas.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: discussed recent work and agreed next steps.', 'MEETING', DATE '2026-05-06'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'kagiso.mahlangu@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: discussed recent work and agreed next steps.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Sprint review notes: solid delivery this cycle, keep the momentum.', 'NOTE', DATE '2026-02-08'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'kagiso.mahlangu@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Sprint review notes: solid delivery this cycle, keep the momentum.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: reviewed goals, workload and growth areas.', 'MEETING', DATE '2026-01-07'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'ryan.naidoo@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: reviewed goals, workload and growth areas.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quick call to unblock the current piece of work.', 'CALL', DATE '2026-03-09'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'ryan.naidoo@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quick call to unblock the current piece of work.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Sprint review notes: solid delivery this cycle, keep the momentum.', 'NOTE', DATE '2026-02-08'
FROM employees a, employees s
WHERE a.email = 'thabo.molefe@psybergate.com' AND s.email = 'lerato.mokwena@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Sprint review notes: solid delivery this cycle, keep the momentum.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-04-10'
FROM employees a, employees s
WHERE a.email = 'thabo.molefe@psybergate.com' AND s.email = 'lerato.mokwena@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quick call to unblock the current piece of work.', 'CALL', DATE '2026-03-09'
FROM employees a, employees s
WHERE a.email = 'thabo.molefe@psybergate.com' AND s.email = 'pieter.steyn@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quick call to unblock the current piece of work.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: discussed recent work and agreed next steps.', 'MEETING', DATE '2026-05-11'
FROM employees a, employees s
WHERE a.email = 'thabo.molefe@psybergate.com' AND s.email = 'pieter.steyn@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: discussed recent work and agreed next steps.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-04-10'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'bongani.zulu@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: reviewed goals, workload and growth areas.', 'MEETING', DATE '2026-01-12'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'bongani.zulu@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: reviewed goals, workload and growth areas.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: discussed recent work and agreed next steps.', 'MEETING', DATE '2026-05-11'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'chloe.vanwyk@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: discussed recent work and agreed next steps.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Sprint review notes: solid delivery this cycle, keep the momentum.', 'NOTE', DATE '2026-02-13'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'chloe.vanwyk@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Sprint review notes: solid delivery this cycle, keep the momentum.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: reviewed goals, workload and growth areas.', 'MEETING', DATE '2026-01-12'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'farai.moyo@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: reviewed goals, workload and growth areas.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quick call to unblock the current piece of work.', 'CALL', DATE '2026-03-14'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'farai.moyo@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quick call to unblock the current piece of work.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Sprint review notes: solid delivery this cycle, keep the momentum.', 'NOTE', DATE '2026-02-13'
FROM employees a, employees s
WHERE a.email = 'daniel.vandermerwe@psybergate.com' AND s.email = 'rajesh.reddy@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Sprint review notes: solid delivery this cycle, keep the momentum.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-04-15'
FROM employees a, employees s
WHERE a.email = 'daniel.vandermerwe@psybergate.com' AND s.email = 'rajesh.reddy@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quick call to unblock the current piece of work.', 'CALL', DATE '2026-03-14'
FROM employees a, employees s
WHERE a.email = 'daniel.vandermerwe@psybergate.com' AND s.email = 'naledi.mokoena@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quick call to unblock the current piece of work.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: discussed recent work and agreed next steps.', 'MEETING', DATE '2026-05-16'
FROM employees a, employees s
WHERE a.email = 'daniel.vandermerwe@psybergate.com' AND s.email = 'naledi.mokoena@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: discussed recent work and agreed next steps.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-04-15'
FROM employees a, employees s
WHERE a.email = 'daniel.vandermerwe@psybergate.com' AND s.email = 'sarah.abrahams@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: reviewed goals, workload and growth areas.', 'MEETING', DATE '2026-01-17'
FROM employees a, employees s
WHERE a.email = 'daniel.vandermerwe@psybergate.com' AND s.email = 'sarah.abrahams@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: reviewed goals, workload and growth areas.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: discussed recent work and agreed next steps.', 'MEETING', DATE '2026-05-16'
FROM employees a, employees s
WHERE a.email = 'daniel.vandermerwe@psybergate.com' AND s.email = 'themba.sithole@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: discussed recent work and agreed next steps.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Sprint review notes: solid delivery this cycle, keep the momentum.', 'NOTE', DATE '2026-02-18'
FROM employees a, employees s
WHERE a.email = 'daniel.vandermerwe@psybergate.com' AND s.email = 'themba.sithole@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Sprint review notes: solid delivery this cycle, keep the momentum.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: reviewed goals, workload and growth areas.', 'MEETING', DATE '2026-01-17'
FROM employees a, employees s
WHERE a.email = 'daniel.vandermerwe@psybergate.com' AND s.email = 'emily.roberts@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: reviewed goals, workload and growth areas.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quick call to unblock the current piece of work.', 'CALL', DATE '2026-03-19'
FROM employees a, employees s
WHERE a.email = 'daniel.vandermerwe@psybergate.com' AND s.email = 'emily.roberts@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quick call to unblock the current piece of work.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Sprint review notes: solid delivery this cycle, keep the momentum.', 'NOTE', DATE '2026-02-18'
FROM employees a, employees s
WHERE a.email = 'daniel.vandermerwe@psybergate.com' AND s.email = 'karabo.sithole@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Sprint review notes: solid delivery this cycle, keep the momentum.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-04-20'
FROM employees a, employees s
WHERE a.email = 'daniel.vandermerwe@psybergate.com' AND s.email = 'karabo.sithole@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quick call to unblock the current piece of work.', 'CALL', DATE '2026-03-19'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'vusi.radebe@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quick call to unblock the current piece of work.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: discussed recent work and agreed next steps.', 'MEETING', DATE '2026-05-21'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'vusi.radebe@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: discussed recent work and agreed next steps.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-04-20'
FROM employees a, employees s
WHERE a.email = 'nomsa.khumalo@psybergate.com' AND s.email = 'amara.okafor@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: reviewed goals, workload and growth areas.', 'MEETING', DATE '2026-01-04'
FROM employees a, employees s
WHERE a.email = 'nomsa.khumalo@psybergate.com' AND s.email = 'amara.okafor@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: reviewed goals, workload and growth areas.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: discussed recent work and agreed next steps.', 'MEETING', DATE '2026-05-21'
FROM employees a, employees s
WHERE a.email = 'john.smith@psybergate.com' AND s.email = 'michael.fourie@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: discussed recent work and agreed next steps.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Sprint review notes: solid delivery this cycle, keep the momentum.', 'NOTE', DATE '2026-02-05'
FROM employees a, employees s
WHERE a.email = 'john.smith@psybergate.com' AND s.email = 'michael.fourie@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Sprint review notes: solid delivery this cycle, keep the momentum.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quarterly check-in: reviewed goals, workload and growth areas.', 'MEETING', DATE '2026-01-15'
FROM employees a, employees s
WHERE a.email = 'admin@psybergate.com' AND s.email = 'jane.doe@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quarterly check-in: reviewed goals, workload and growth areas.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Sprint review notes: solid delivery this cycle, keep the momentum.', 'NOTE', DATE '2026-02-15'
FROM employees a, employees s
WHERE a.email = 'admin@psybergate.com' AND s.email = 'john.smith@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Sprint review notes: solid delivery this cycle, keep the momentum.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Quick call to unblock the current piece of work.', 'CALL', DATE '2026-03-15'
FROM employees a, employees s
WHERE a.email = 'john.smith@psybergate.com' AND s.email = 'daniel.vandermerwe@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Quick call to unblock the current piece of work.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, 'Followed up by email on the outstanding action items.', 'EMAIL', DATE '2026-04-15'
FROM employees a, employees s
WHERE a.email = 'jane.doe@psybergate.com' AND s.email = 'thabo.molefe@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = 'Followed up by email on the outstanding action items.');
INSERT INTO interactions (author_id, subject_id, note, type, date)
SELECT a.id, s.id, '1:1: discussed recent work and agreed next steps.', 'MEETING', DATE '2026-05-15'
FROM employees a, employees s
WHERE a.email = 'nomsa.khumalo@psybergate.com' AND s.email = 'jane.doe@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM interactions i WHERE i.author_id = a.id AND i.subject_id = s.id AND i.note = '1:1: discussed recent work and agreed next steps.');

-- ---------------------------------------------------------------------------
-- Tasks (created by managers, relating to reports; mixed OPEN/DONE, some
-- assigned across managers).
-- ---------------------------------------------------------------------------
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Complete quarterly self-review', NULL, 'DONE', r.id, c.id, a.id, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'thabo.molefe@psybergate.com'
JOIN employees a ON a.email = 'admin@psybergate.com'
WHERE r.email = 'sipho.dlamini@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Complete quarterly self-review');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-12', now(), now()
FROM employees r
JOIN employees c ON c.email = 'thabo.molefe@psybergate.com'
WHERE r.email = 'sipho.dlamini@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Finish onboarding checklist');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Update skills profile', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-07', now(), now()
FROM employees r
JOIN employees c ON c.email = 'thabo.molefe@psybergate.com'
WHERE r.email = 'aisha.patel@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Update skills profile');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Prepare demo for the sprint review', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-03-08', now(), now()
FROM employees r
JOIN employees c ON c.email = 'thabo.molefe@psybergate.com'
WHERE r.email = 'liam.botha@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Prepare demo for the sprint review');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Document the latest release', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-04-12', now(), now()
FROM employees r
JOIN employees c ON c.email = 'thabo.molefe@psybergate.com'
WHERE r.email = 'liam.botha@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Document the latest release');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'thabo.molefe@psybergate.com'
WHERE r.email = 'zanele.nkosi@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Finish onboarding checklist');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Book performance conversation', NULL, 'OPEN', r.id, c.id, a.id, DATE '2026-05-10', now(), now()
FROM employees r
JOIN employees c ON c.email = 'jane.doe@psybergate.com'
JOIN employees a ON a.email = 'thabo.molefe@psybergate.com'
WHERE r.email = 'kagiso.mahlangu@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Book performance conversation');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Shadow a peer for cross-skilling', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-06-12', now(), now()
FROM employees r
JOIN employees c ON c.email = 'jane.doe@psybergate.com'
WHERE r.email = 'kagiso.mahlangu@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Shadow a peer for cross-skilling');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Document the latest release', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-06-11', now(), now()
FROM employees r
JOIN employees c ON c.email = 'jane.doe@psybergate.com'
WHERE r.email = 'ryan.naidoo@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Document the latest release');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Review team retro actions', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'thabo.molefe@psybergate.com'
WHERE r.email = 'lerato.mokwena@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Review team retro actions');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Update skills profile', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-12', now(), now()
FROM employees r
JOIN employees c ON c.email = 'thabo.molefe@psybergate.com'
WHERE r.email = 'lerato.mokwena@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Update skills profile');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Shadow a peer for cross-skilling', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-13', now(), now()
FROM employees r
JOIN employees c ON c.email = 'thabo.molefe@psybergate.com'
WHERE r.email = 'pieter.steyn@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Shadow a peer for cross-skilling');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Complete quarterly self-review', NULL, 'OPEN', r.id, c.id, a.id, DATE '2026-03-14', now(), now()
FROM employees r
JOIN employees c ON c.email = 'jane.doe@psybergate.com'
JOIN employees a ON a.email = 'daniel.vandermerwe@psybergate.com'
WHERE r.email = 'bongani.zulu@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Complete quarterly self-review');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-04-12', now(), now()
FROM employees r
JOIN employees c ON c.email = 'jane.doe@psybergate.com'
WHERE r.email = 'bongani.zulu@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Finish onboarding checklist');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Update skills profile', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'jane.doe@psybergate.com'
WHERE r.email = 'chloe.vanwyk@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Update skills profile');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Prepare demo for the sprint review', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-05-16', now(), now()
FROM employees r
JOIN employees c ON c.email = 'jane.doe@psybergate.com'
WHERE r.email = 'farai.moyo@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Prepare demo for the sprint review');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Document the latest release', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-06-12', now(), now()
FROM employees r
JOIN employees c ON c.email = 'jane.doe@psybergate.com'
WHERE r.email = 'farai.moyo@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Document the latest release');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-06-17', now(), now()
FROM employees r
JOIN employees c ON c.email = 'daniel.vandermerwe@psybergate.com'
WHERE r.email = 'rajesh.reddy@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Finish onboarding checklist');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Book performance conversation', NULL, 'DONE', r.id, c.id, a.id, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'daniel.vandermerwe@psybergate.com'
JOIN employees a ON a.email = 'john.smith@psybergate.com'
WHERE r.email = 'naledi.mokoena@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Book performance conversation');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Shadow a peer for cross-skilling', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-12', now(), now()
FROM employees r
JOIN employees c ON c.email = 'daniel.vandermerwe@psybergate.com'
WHERE r.email = 'naledi.mokoena@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Shadow a peer for cross-skilling');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Document the latest release', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-19', now(), now()
FROM employees r
JOIN employees c ON c.email = 'daniel.vandermerwe@psybergate.com'
WHERE r.email = 'sarah.abrahams@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Document the latest release');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Review team retro actions', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-03-20', now(), now()
FROM employees r
JOIN employees c ON c.email = 'daniel.vandermerwe@psybergate.com'
WHERE r.email = 'themba.sithole@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Review team retro actions');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Update skills profile', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-04-12', now(), now()
FROM employees r
JOIN employees c ON c.email = 'daniel.vandermerwe@psybergate.com'
WHERE r.email = 'themba.sithole@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Update skills profile');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Shadow a peer for cross-skilling', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'daniel.vandermerwe@psybergate.com'
WHERE r.email = 'emily.roberts@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Shadow a peer for cross-skilling');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Complete quarterly self-review', NULL, 'OPEN', r.id, c.id, a.id, DATE '2026-05-22', now(), now()
FROM employees r
JOIN employees c ON c.email = 'daniel.vandermerwe@psybergate.com'
JOIN employees a ON a.email = 'jane.doe@psybergate.com'
WHERE r.email = 'karabo.sithole@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Complete quarterly self-review');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-06-12', now(), now()
FROM employees r
JOIN employees c ON c.email = 'daniel.vandermerwe@psybergate.com'
WHERE r.email = 'karabo.sithole@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Finish onboarding checklist');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Update skills profile', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-06-23', now(), now()
FROM employees r
JOIN employees c ON c.email = 'jane.doe@psybergate.com'
WHERE r.email = 'vusi.radebe@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Update skills profile');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Prepare demo for the sprint review', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'nomsa.khumalo@psybergate.com'
WHERE r.email = 'amara.okafor@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Prepare demo for the sprint review');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Document the latest release', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-12', now(), now()
FROM employees r
JOIN employees c ON c.email = 'nomsa.khumalo@psybergate.com'
WHERE r.email = 'amara.okafor@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Document the latest release');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finish onboarding checklist', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-02-25', now(), now()
FROM employees r
JOIN employees c ON c.email = 'john.smith@psybergate.com'
WHERE r.email = 'michael.fourie@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Finish onboarding checklist');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Submit quarterly headcount plan', NULL, 'OPEN', r.id, c.id, NULL, DATE '2026-05-20', now(), now()
FROM employees r
JOIN employees c ON c.email = 'admin@psybergate.com'
WHERE r.email = 'jane.doe@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Submit quarterly headcount plan');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Finalise hiring pipeline report', NULL, 'OPEN', r.id, c.id, a.id, DATE '2026-04-18', now(), now()
FROM employees r
JOIN employees c ON c.email = 'admin@psybergate.com'
JOIN employees a ON a.email = 'nomsa.khumalo@psybergate.com'
WHERE r.email = 'john.smith@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Finalise hiring pipeline report');
INSERT INTO tasks (title, description, status, relates_to_id, created_by_id, assignee_id, due_date, created_at, updated_at)
SELECT 'Publish FY26 product roadmap', NULL, 'DONE', r.id, c.id, NULL, NULL, now(), now()
FROM employees r
JOIN employees c ON c.email = 'admin@psybergate.com'
WHERE r.email = 'daniel.vandermerwe@psybergate.com'
  AND NOT EXISTS (SELECT 1 FROM tasks t2 WHERE t2.relates_to_id = r.id AND t2.title = 'Publish FY26 product roadmap');
