@skills
Feature: Skills Register — epic-5-skills-register
  As an authenticated user
  I want to record and query employee skills
  So that the organisation can answer "Who's strong on Angular?"

  Background:
    Given the API is running
    And an authenticated user exists

  # ── Employee skills CRUD ───────────────────────────────────────────────

  Scenario: Add a skill to an employee
    Given an employee exists
    When I send a POST to "/api/employees/${employeeId}/skills" with body:
      """
      { "skillName": "Angular", "years": 4 }
      """
    Then the response status should be 201
    And the response body should contain "skillName" = "Angular"
    And the response body should contain "years" = "4"

  Scenario: Reject skill with negative years
    Given an employee exists
    When I send a POST to "/api/employees/${employeeId}/skills" with body:
      """
      { "skillName": "Java", "years": -1 }
      """
    Then the response status should be 400

  Scenario: Reject skill with missing years
    Given an employee exists
    When I send a POST to "/api/employees/${employeeId}/skills" with body:
      """
      { "skillName": "Java" }
      """
    Then the response status should be 400

  Scenario: Reject duplicate skill for same employee
    Given an employee exists
    And the employee has the skill "TypeScript" with 3 years
    When I send a POST to "/api/employees/${employeeId}/skills" with body:
      """
      { "skillName": "TypeScript", "years": 2 }
      """
    Then the response status should be 409

  Scenario: Skill name matching is case-insensitive for dedup
    Given an employee exists
    And the employee has the skill "Java" with 5 years
    When I send a POST to "/api/employees/${employeeId}/skills" with body:
      """
      { "skillName": "java", "years": 2 }
      """
    Then the response status should be 409

  Scenario: Add skill for unknown employee returns 404
    When I send a POST to "/api/employees/999999999/skills" with body:
      """
      { "skillName": "Go", "years": 1 }
      """
    Then the response status should be 404

  Scenario: Update years on existing employee skill
    Given an employee exists
    And the employee has the skill "Docker" with 2 years
    When I send a PUT to "/api/employees/${employeeId}/skills/${skillId}" with body:
      """
      { "years": 5 }
      """
    Then the response status should be 200
    And the response body should contain "years" = "5"

  Scenario: Delete an employee skill
    Given an employee exists
    And the employee has the skill "SQL" with 6 years
    When I send a DELETE to "/api/employees/${employeeId}/skills/${skillId}"
    Then the response status should be 204

  Scenario: List skills for an employee with no skills returns empty array
    Given an employee exists
    When I send a GET to "/api/employees/${employeeId}/skills"
    Then the response status should be 200
    And the response body should contain an empty "skills"

  Scenario: List skills for unknown employee returns 404
    When I send a GET to "/api/employees/999999999/skills"
    Then the response status should be 404

  # ── Skill register browse ──────────────────────────────────────────────

  Scenario: Browse the skills register returns all canonical skills
    Given an employee exists
    And the employee has the skill "Spring Boot" with 3 years
    When I send a GET to "/api/skills"
    Then the response status should be 200
    And the response body should contain "Spring Boot"

  # ── Ranked skill search ────────────────────────────────────────────────

  Scenario: Search by skill returns matching employees
    Given an employee exists
    And the employee has the skill "Angular" with 4 years
    When I send a GET to "/api/skills/search?skill=Angular"
    Then the response status should be 200
    And the response body should contain "Angular"

  Scenario: Search for skill nobody has returns empty list
    When I send a GET to "/api/skills/search?skill=COBOL"
    Then the response status should be 200
    And the response body should contain "[]"

  Scenario: Search without skill parameter returns 400
    When I send a GET to "/api/skills/search"
    Then the response status should be 400

  # ── Portfolio includes skills ──────────────────────────────────────────

  Scenario: Portfolio response includes skills section
    Given an employee exists
    And the employee has the skill "Angular" with 4 years
    When I send a GET to "/api/employees/${employeeId}/portfolio"
    Then the response status should be 200
    And the response body should contain an "skills"
