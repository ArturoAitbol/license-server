@ProjectsTest
Feature: Projects

  Background: : Login successfully with valid credentials
    Given I am on the landing page
    When I try to login with email and password

  @createSubaccountCustomer
  Scenario: Create a test customer for projects tests
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | projectCustomerTest                   |
      | type          | MSP                                   |
      | adminEmail    | test-project@tekvizionlabs.com        |
      | subaccount    | Default                               |
      | subAdminEmail | project-subaccount@tekvizionlabs.com  |
      | testCustomer  | yes                                   |
    Then I see the customer "projectCustomerTest" in the table

  @createProject
  Scenario: Create a project
    Given I see the customer "projectCustomerTest" in the table
    And I go to the Projects List of "projectCustomerTest"
    And I open the Add Project form
    When I create a project with the following data
      | startDate | 8/17/2022     |
      | name      | projectTest   |
      | code      | PRT-001       |
    Then I should see the message "Project added successfully!"
    Then I see the project "projectTest" in the table

  @editProject
  Scenario: Edit a project
    Given I see the customer "projectCustomerTest" in the table
    And I go to the Projects List of "projectCustomerTest"
    And I see the project "projectTest" in the table
    When I edit the project "projectTest" with the following data
#      | startDate | 8/20/2022         |
      | name      | projectModified   |
      | code      | PRT-002           |
      | type      | Closed            |
      | closeDate | 8/30/2022         |
    Then I should see the message "Project edited successfully!"
    And I should see the modified data in Projects table

  @closeProject
  Scenario: Close a project
    Given I see the customer "projectCustomerTest" in the table
    And I go to the Projects List of "projectCustomerTest"
    And I see the project "projectModified" in the table
    When I close the project "projectModified"
    Then I should see the message "Project updated successfully!"
    And I should see the project "projectModified" in the table with a status "Closed"

  @deleteProject
  Scenario: Delete a project
    Given I see the customer "projectCustomerTest" in the table
    And I go to the Projects List of "projectCustomerTest"
    And I see the project "projectModified" in the table
    When I delete the project "projectModified"
    Then I should see the message "Project deleted successfully!"
