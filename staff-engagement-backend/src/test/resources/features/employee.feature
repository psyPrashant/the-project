@employee
Feature: Employee management
  As an authenticated user
  I want to manage employee records
  So that staff data is maintained

  Background:
    Given the API is running
    And I am authenticated as "admin@psybergate.com"

  Scenario: Create a new employee
    When I send a POST to "/api/employees" with body:
      """
      {
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane.cucumber@example.com"
      }
      """
    Then the response status should be 201
    And the response body should contain "firstName" = "Jane"
    And the response body should contain an "id"
    And I store the response field "id" as "employeeId"

  Scenario: Reject duplicate email
    Given an employee exists with firstName "John", lastName "Smith", email "john.cucumber@example.com"
    When I send a POST to "/api/employees" with body:
      """
      {
        "firstName": "Johnny",
        "lastName": "Duplicate",
        "email": "john.cucumber@example.com"
      }
      """
    Then the response status should be 409

  Scenario: Get profile for an existing employee
    Given an employee exists with firstName "Profile", lastName "Test", email "profile.cucumber@example.com"
    When I send a GET to "/api/employees/${employeeId}"
    Then the response status should be 200
    And the response body should contain "email" = "profile.cucumber@example.com"

  Scenario: Get profile for an unknown employee
    When I send a GET to "/api/employees/999999999"
    Then the response status should be 404

  Scenario: List employees includes created employee
    Given an employee exists with firstName "Listed", lastName "User", email "listed.cucumber@example.com"
    When I send a GET to "/api/employees"
    Then the response status should be 200
    And the response body should contain "listed.cucumber@example.com"

  Scenario: Search employees by name
    Given an employee exists with firstName "ZyxSearch", lastName "Unique", email "search.cucumber@example.com"
    When I send a GET to "/api/employees?search=ZyxSearch"
    Then the response status should be 200
    And the response body should contain "search.cucumber@example.com"

  Scenario: Update an employee
    Given an employee exists with firstName "Old", lastName "Name", email "update.cucumber@example.com"
    When I send a PUT to "/api/employees/${employeeId}" with body:
      """
      {
        "firstName": "New",
        "lastName": "Name",
        "email": "update.cucumber@example.com",
        "jobTitle": "Manager"
      }
      """
    Then the response status should be 200
    And the response body should contain "firstName" = "New"
    And the response body should contain "jobTitle" = "Manager"

  Scenario: Update an unknown employee
    When I send a PUT to "/api/employees/999999999" with body:
      """
      {
        "firstName": "A",
        "lastName": "B",
        "email": "unknown.cucumber@example.com"
      }
      """
    Then the response status should be 404

  Scenario: Archive an employee
    Given an employee exists with firstName "Archive", lastName "Me", email "archive.cucumber@example.com"
    When I send a PATCH to "/api/employees/${employeeId}/archive"
    Then the response status should be 204
    When I send a GET to "/api/employees?search=archive.cucumber@example.com"
    Then the response body should not contain "archive.cucumber@example.com"

  Scenario: Reject employee with missing first name
    When I send a POST to "/api/employees" with body:
      """
      {
        "firstName": "",
        "lastName": "User",
        "email": "missing.cucumber@example.com"
      }
      """
    Then the response status should be 400
