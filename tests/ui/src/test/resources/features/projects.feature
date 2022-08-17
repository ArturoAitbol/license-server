@ProjectsTest
Feature: Projects

  Background: : Login successfully with valid credentials
    Given I am on the landing page
    When I try to login with "aamoroso@tekvizionlabs.com" as email and "Arthag19" as password
    And I see the customer "Test Distributor" in the table
    And I go to the Projects List of "Test Distributor"

  @createProject
  Scenario: Create a project
    Given I open the Add Project form
    When I create a project with the following data
      | startDate | 8/17/2022     |
      | name      | projectTest   |
      | code      | PRT-001       |
    Then I see the project "projectTest" in the table

  @editProject
  Scenario: Create a project
    Given I edit the project "projectTest" with the following data
#      | startDate | 8/20/2022         |
      | name      | projectModified   |
      | code      | PRT-002           |
      | type      | Closed            |
      | closeDate | 8/30/2022         |
    Then I should see the modified data in Projects table
    And I should see the message "Project edited successfully!"