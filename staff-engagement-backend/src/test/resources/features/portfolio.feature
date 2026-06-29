@portfolio
Feature: Employee portfolio management
  As an authenticated user
  I want to manage an employee's education, projects, and showcase links
  So that their background and public work are captured in one place

  Background:
    Given the API is running
    And an authenticated user exists

  Scenario: Add education to an employee's portfolio
    Given an employee exists
    When I send a POST to "/api/employees/${employeeId}/portfolio/education" with body:
      """
      {
        "institution": "University of Example",
        "qualification": "BSc Computer Science",
        "fieldOfStudy": "Software Engineering",
        "startYear": 2016,
        "endYear": 2020
      }
      """
    Then the response status should be 201
    And the response body should contain "institution" = "University of Example"

  Scenario: Reject education with missing required field
    Given an employee exists
    When I send a POST to "/api/employees/${employeeId}/portfolio/education" with body:
      """
      {
        "institution": "",
        "qualification": "BSc Computer Science"
      }
      """
    Then the response status should be 400

  Scenario: Add a project to an employee's portfolio
    Given an employee exists
    When I send a POST to "/api/employees/${employeeId}/portfolio/projects" with body:
      """
      {
        "name": "Staff Engagement Platform",
        "description": "Internal staff engagement POC",
        "startDate": "2026-01-15",
        "endDate": "2026-06-30",
        "url": "https://example.com/project"
      }
      """
    Then the response status should be 201
    And the response body should contain "name" = "Staff Engagement Platform"

  Scenario: Reject project with missing required field
    Given an employee exists
    When I send a POST to "/api/employees/${employeeId}/portfolio/projects" with body:
      """
      {
        "name": "",
        "description": "Internal staff engagement POC"
      }
      """
    Then the response status should be 400

  Scenario: Add a showcase link with valid URL
    Given an employee exists
    When I send a POST to "/api/employees/${employeeId}/portfolio/links" with body:
      """
      {
        "label": "GitHub",
        "url": "https://github.com/example"
      }
      """
    Then the response status should be 201
    And the response body should contain "label" = "GitHub"

  Scenario: Reject showcase link with invalid URL
    Given an employee exists
    When I send a POST to "/api/employees/${employeeId}/portfolio/links" with body:
      """
      {
        "label": "Bad Link",
        "url": "not-a-url"
      }
      """
    Then the response status should be 400

  Scenario: View full portfolio
    Given an employee exists
    And the employee has an education entry
    And the employee has a project
    And the employee has a showcase link
    When I send a GET to "/api/employees/${employeeId}/portfolio"
    Then the response status should be 200
    And the response body should contain an "education"
    And the response body should contain a "projects"
    And the response body should contain a "links"

  Scenario: View empty portfolio
    Given an employee exists
    When I send a GET to "/api/employees/${employeeId}/portfolio"
    Then the response status should be 200
    And the response body should contain an empty "education"
    And the response body should contain an empty "projects"
    And the response body should contain an empty "links"

  Scenario: Update education
    Given an employee exists
    And the employee has an education entry
    When I send a PUT to "/api/employees/${employeeId}/portfolio/education/${educationId}" with body:
      """
      {
        "institution": "Updated University",
        "qualification": "MSc Computer Science",
        "fieldOfStudy": "Software Engineering",
        "startYear": 2016,
        "endYear": 2022
      }
      """
    Then the response status should be 200
    And the response body should contain "institution" = "Updated University"

  Scenario: Delete a project
    Given an employee exists
    And the employee has a project
    When I send a DELETE to "/api/employees/${employeeId}/portfolio/projects/${projectId}"
    Then the response status should be 204

  Scenario: Portfolio operation for unknown employee returns 404
    When I send a GET to "/api/employees/999999999/portfolio"
    Then the response status should be 404
