@interaction
Feature: Interaction management
  As an authenticated user
  I want to log and manage interactions against employees
  So that engagement history is tracked

  Background:
    Given the API is running
    And I am authenticated as "admin@psybergate.com"

  Scenario: Log an interaction against an employee
    Given an employee exists with firstName "Subject", lastName "One", email "subject.cucumber@example.com"
    When I send a POST to "/api/interactions" with body:
      """
      {
        "subjectId": ${employeeId},
        "note": "Discussed project goals",
        "type": "MEETING",
        "date": "2026-06-25"
      }
      """
    Then the response status should be 201
    And the response body should contain "note" = "Discussed project goals"
    And the response body should contain an "id"
    And I store the response field "id" as "interactionId"

  Scenario: Self-interaction is allowed
    When I send a POST to "/api/interactions" with body:
      """
      {
        "subjectId": ${employeeId},
        "note": "Personal log entry",
        "type": "NOTE",
        "date": "2026-06-25"
      }
      """
    Then the response status should be 201
    And the response body should contain "note" = "Personal log entry"

  Scenario: Reject interaction with missing note
    Given an employee exists with firstName "Noteless", lastName "Subject", email "noteless.cucumber@example.com"
    When I send a POST to "/api/interactions" with body:
      """
      {
        "subjectId": ${employeeId},
        "note": "",
        "type": "NOTE",
        "date": "2026-06-25"
      }
      """
    Then the response status should be 400

  Scenario: Reject interaction with missing subject
    When I send a POST to "/api/interactions" with body:
      """
      {
        "note": "Orphan note",
        "type": "NOTE",
        "date": "2026-06-25"
      }
      """
    Then the response status should be 400

  Scenario: Reject interaction with non-existent subject
    When I send a POST to "/api/interactions" with body:
      """
      {
        "subjectId": 999999999,
        "note": "No subject",
        "type": "NOTE",
        "date": "2026-06-25"
      }
      """
    Then the response status should be 404

  Scenario: View interactions for a subject
    Given an employee exists with firstName "Timeline", lastName "Subject", email "timeline.cucumber@example.com"
    And an interaction exists for subject "timeline.cucumber@example.com" created by "admin@psybergate.com" with note "First note" and type "NOTE" and date "2026-06-23"
    And an interaction exists for subject "timeline.cucumber@example.com" created by "admin@psybergate.com" with note "Second note" and type "NOTE" and date "2026-06-25"
    When I send a GET to "/api/interactions?subjectId=${subjectId}"
    Then the response status should be 200
    And the response body should contain "First note"
    And the response body should contain "Second note"

  Scenario: Get interaction by id
    Given an employee exists with firstName "Single", lastName "Interaction", email "single.cucumber@example.com"
    And an interaction exists for subject "single.cucumber@example.com" created by "admin@psybergate.com" with note "Retrieve me" and type "NOTE" and date "2026-06-25"
    When I send a GET to "/api/interactions/${interactionId}"
    Then the response status should be 200
    And the response body should contain "note" = "Retrieve me"

  Scenario: Update own interaction
    Given an employee exists with firstName "Update", lastName "Subject", email "update.cucumber@example.com"
    And an interaction exists for subject "update.cucumber@example.com" created by "admin@psybergate.com" with note "Original" and type "NOTE" and date "2026-06-25"
    When I send a PUT to "/api/interactions/${interactionId}" with body:
      """
      {
        "subjectId": ${subjectId},
        "note": "Updated",
        "type": "CALL",
        "date": "2026-06-25"
      }
      """
    Then the response status should be 200
    And the response body should contain "note" = "Updated"
    And the response body should contain "type" = "CALL"

  Scenario: Non-author cannot update an interaction
    Given an employee exists with firstName "Locked", lastName "Subject", email "locked.cucumber@example.com"
    And an interaction exists for subject "locked.cucumber@example.com" created by "jane.doe@psybergate.com" with note "Protected" and type "NOTE" and date "2026-06-25"
    And I am authenticated as "admin@psybergate.com"
    When I send a PUT to "/api/interactions/${interactionId}" with body:
      """
      {
        "subjectId": ${subjectId},
        "note": "Hacked",
        "type": "NOTE",
        "date": "2026-06-25"
      }
      """
    Then the response status should be 403

  Scenario: Delete own interaction
    Given an employee exists with firstName "Delete", lastName "Subject", email "delete.cucumber@example.com"
    And an interaction exists for subject "delete.cucumber@example.com" created by "admin@psybergate.com" with note "To delete" and type "NOTE" and date "2026-06-25"
    When I send a DELETE to "/api/interactions/${interactionId}"
    Then the response status should be 204
    When I send a GET to "/api/interactions/${interactionId}"
    Then the response status should be 404

  Scenario: Non-author cannot delete an interaction
    Given an employee exists with firstName "Protected", lastName "Subject", email "protected.cucumber@example.com"
    And an interaction exists for subject "protected.cucumber@example.com" created by "jane.doe@psybergate.com" with note "Protected" and type "NOTE" and date "2026-06-25"
    And I am authenticated as "admin@psybergate.com"
    When I send a DELETE to "/api/interactions/${interactionId}"
    Then the response status should be 403

  Scenario: Filter interactions by type
    Given an employee exists with firstName "Filter", lastName "Subject", email "filter.cucumber@example.com"
    And an interaction exists for subject "filter.cucumber@example.com" created by "admin@psybergate.com" with note "Meeting note" and type "MEETING" and date "2026-06-25"
    And an interaction exists for subject "filter.cucumber@example.com" created by "admin@psybergate.com" with note "Call note" and type "CALL" and date "2026-06-25"
    When I send a GET to "/api/interactions?subjectId=${subjectId}&type=MEETING"
    Then the response status should be 200
    And the response body should contain "Meeting note"
    And the response body should not contain "Call note"
