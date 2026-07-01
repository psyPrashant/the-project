@task
Feature: Task management
  As an authenticated employee
  I want to create and manage follow-up tasks
  So that interactions lead to tracked action items

  Background:
    Given the API is running
    And I am authenticated as "admin@psybergate.com"

  # T1 — Create task from interaction

  Scenario: Create a task spawned from an interaction
    Given an employee exists with firstName "Subject", lastName "Task1", email "subject.task1@example.com"
    And an interaction exists for subject "subject.task1@example.com" created by "admin@psybergate.com" with note "Discussed goals" and type "MEETING" and date "2026-06-25"
    When I send a POST to "/api/tasks/from-interaction" with body:
      """
      {
        "interactionId": ${interactionId},
        "title": "Follow up on goals"
      }
      """
    Then the response status should be 201
    And the response body should contain "title" = "Follow up on goals"
    And the response body should contain an "id"
    And I store the response field "id" as "taskId"

  Scenario: Create task from interaction sets relatesTo from interaction subject
    Given an employee exists with firstName "Subject", lastName "Task2", email "subject.task2@example.com"
    And an interaction exists for subject "subject.task2@example.com" created by "admin@psybergate.com" with note "Performance review" and type "MEETING" and date "2026-06-25"
    When I send a POST to "/api/tasks/from-interaction" with body:
      """
      {
        "interactionId": ${interactionId},
        "title": "Action from review"
      }
      """
    Then the response status should be 201
    And the response body should contain "status" = "OPEN"

  Scenario: Reject task from interaction with missing title
    Given an employee exists with firstName "Subject", lastName "Task3", email "subject.task3@example.com"
    And an interaction exists for subject "subject.task3@example.com" created by "admin@psybergate.com" with note "A meeting" and type "NOTE" and date "2026-06-25"
    When I send a POST to "/api/tasks/from-interaction" with body:
      """
      {
        "interactionId": ${interactionId},
        "title": ""
      }
      """
    Then the response status should be 400

  Scenario: Reject task from interaction with non-existent interaction
    When I send a POST to "/api/tasks/from-interaction" with body:
      """
      {
        "interactionId": 999999999,
        "title": "Orphan task"
      }
      """
    Then the response status should be 404

  # T2 — Create standalone task

  Scenario: Create a standalone task against an employee
    Given an employee exists with firstName "Subject", lastName "Task4", email "subject.task4@example.com"
    When I send a POST to "/api/tasks" with body:
      """
      {
        "relatesToId": ${employeeId},
        "title": "Check in with employee"
      }
      """
    Then the response status should be 201
    And the response body should contain "title" = "Check in with employee"
    And the response body should contain "status" = "OPEN"
    And I store the response field "id" as "taskId"

  Scenario: Reject standalone task with missing title
    Given an employee exists with firstName "Subject", lastName "Task5", email "subject.task5@example.com"
    When I send a POST to "/api/tasks" with body:
      """
      {
        "relatesToId": ${employeeId},
        "title": ""
      }
      """
    Then the response status should be 400

  Scenario: Reject standalone task with non-existent employee
    When I send a POST to "/api/tasks" with body:
      """
      {
        "relatesToId": 999999999,
        "title": "Orphan task"
      }
      """
    Then the response status should be 404

  # T3 — View my tasks

  Scenario: My tasks returns tasks where current user is the subject
    Given an employee exists with firstName "Subject", lastName "Mine", email "subject.mine@example.com"
    And a standalone task exists for employee "subject.mine@example.com" with title "Task for subject" created by "admin@psybergate.com"
    And I am authenticated as "subject.mine@example.com"
    When I send a GET to "/api/tasks/mine"
    Then the response status should be 200
    And the response body should contain "Task for subject"

  Scenario: My tasks excludes tasks relating to other employees
    Given an employee exists with firstName "Other", lastName "Person", email "other.person@example.com"
    And a standalone task exists for employee "other.person@example.com" with title "Not my task" created by "admin@psybergate.com"
    When I send a GET to "/api/tasks/mine"
    Then the response status should be 200
    And the response body should not contain "Not my task"

  # T4 — Update task status

  Scenario: Subject can mark a task as done
    Given an employee exists with firstName "Subject", lastName "Done", email "subject.done@example.com"
    And a standalone task exists for employee "subject.done@example.com" with title "Mark me done" created by "admin@psybergate.com"
    And I am authenticated as "subject.done@example.com"
    When I send a PATCH to "/api/tasks/${taskId}/status" with body:
      """
      { "status": "DONE" }
      """
    Then the response status should be 200
    And the response body should contain "status" = "DONE"

  Scenario: Creator can mark a task as done
    Given an employee exists with firstName "Subject", lastName "Done2", email "subject.done2@example.com"
    And a standalone task exists for employee "subject.done2@example.com" with title "Creator done task" created by "admin@psybergate.com"
    When I send a PATCH to "/api/tasks/${taskId}/status" with body:
      """
      { "status": "DONE" }
      """
    Then the response status should be 200
    And the response body should contain "status" = "DONE"

  Scenario: Unrelated employee cannot update task status
    Given an employee exists with firstName "Subject", lastName "Protected", email "subject.protected@example.com"
    And a standalone task exists for employee "subject.protected@example.com" with title "Protected task" created by "admin@psybergate.com"
    And I am authenticated as "jane.doe@psybergate.com"
    When I send a PATCH to "/api/tasks/${taskId}/status" with body:
      """
      { "status": "DONE" }
      """
    Then the response status should be 403

  # T5 — Due date and assignee

  Scenario: Create task with a due date and assignee
    Given an employee exists with firstName "Subject", lastName "T5", email "subject.t5@example.com"
    When I send a POST to "/api/tasks" with body:
      """
      {
        "relatesToId": ${employeeId},
        "title": "Task with due date",
        "dueDate": "2026-12-31",
        "assigneeId": ${employeeId}
      }
      """
    Then the response status should be 201
    And the response body should contain "dueDate" = "2026-12-31"

  # T6 — Edit task

  Scenario: Creator can edit a task
    Given an employee exists with firstName "Subject", lastName "EditT1", email "subject.edit1@example.com"
    And a standalone task exists for employee "subject.edit1@example.com" with title "Original title" created by "admin@psybergate.com"
    When I send a PUT to "/api/tasks/${taskId}" with body:
      """
      { "title": "Updated title" }
      """
    Then the response status should be 200
    And the response body should contain "title" = "Updated title"

  Scenario: Subject can edit a task
    Given an employee exists with firstName "Subject", lastName "EditT2", email "subject.edit2@example.com"
    And a standalone task exists for employee "subject.edit2@example.com" with title "Original" created by "admin@psybergate.com"
    And I am authenticated as "subject.edit2@example.com"
    When I send a PUT to "/api/tasks/${taskId}" with body:
      """
      { "title": "Edited by subject" }
      """
    Then the response status should be 200
    And the response body should contain "title" = "Edited by subject"

  Scenario: Unrelated employee cannot edit a task
    Given an employee exists with firstName "Subject", lastName "EditT3", email "subject.edit3@example.com"
    And a standalone task exists for employee "subject.edit3@example.com" with title "Protected edit" created by "admin@psybergate.com"
    And I am authenticated as "jane.doe@psybergate.com"
    When I send a PUT to "/api/tasks/${taskId}" with body:
      """
      { "title": "Hijacked title" }
      """
    Then the response status should be 403

  Scenario: Edit task with blank title returns 400
    Given an employee exists with firstName "Subject", lastName "EditT4", email "subject.edit4@example.com"
    And a standalone task exists for employee "subject.edit4@example.com" with title "Valid title" created by "admin@psybergate.com"
    When I send a PUT to "/api/tasks/${taskId}" with body:
      """
      { "title": "" }
      """
    Then the response status should be 400

  Scenario: Edit non-existent task returns 404
    When I send a PUT to "/api/tasks/999999999" with body:
      """
      { "title": "Ghost task" }
      """
    Then the response status should be 404

  # T7 — Delete task

  Scenario: Creator can delete a task
    Given an employee exists with firstName "Subject", lastName "DelT1", email "subject.del1@example.com"
    And a standalone task exists for employee "subject.del1@example.com" with title "Task to delete" created by "admin@psybergate.com"
    When I send a DELETE to "/api/tasks/${taskId}"
    Then the response status should be 204

  Scenario: Subject cannot delete a task
    Given an employee exists with firstName "Subject", lastName "DelT2", email "subject.del2@example.com"
    And a standalone task exists for employee "subject.del2@example.com" with title "Protected delete" created by "admin@psybergate.com"
    And I am authenticated as "subject.del2@example.com"
    When I send a DELETE to "/api/tasks/${taskId}"
    Then the response status should be 403

  Scenario: Delete non-existent task returns 404
    When I send a DELETE to "/api/tasks/999999999"
    Then the response status should be 404

  # T8 — Reopen task (toggle status back to OPEN)

  Scenario: Subject can reopen a done task
    Given an employee exists with firstName "Subject", lastName "Reopen", email "subject.reopen@example.com"
    And a standalone task exists for employee "subject.reopen@example.com" with title "Task to reopen" created by "admin@psybergate.com"
    And I am authenticated as "subject.reopen@example.com"
    When I send a PATCH to "/api/tasks/${taskId}/status" with body:
      """
      { "status": "DONE" }
      """
    Then the response status should be 200
    When I send a PATCH to "/api/tasks/${taskId}/status" with body:
      """
      { "status": "OPEN" }
      """
    Then the response status should be 200
    And the response body should contain "status" = "OPEN"
