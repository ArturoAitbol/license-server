@projectsTest
Feature: Projects
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"

  @createProjectCustomer
  Scenario: Create a test customer for projects tests
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | functional-test-project               |
      | type          | MSP                                   |
      | adminEmail    | test-project@tekvizion.com            |
      | subaccount    | Default                               |
      | subAdminEmail | test-project@tekvizion.com            |
      | testCustomer  | yes                                   |
    Then I see the customer "functional-test-project" in the table
    
  @addLicense
  Scenario: Add a subscription for projects
    Given I see the customer "functional-test-project" in the table
    And I go to the Subscriptions view of "functional-test-project"
    And I should see the "tekVizion 360 Subscriptions" table
    And I open the Add Subscription form
    When I create a subscription with the following data
      | startDate         | 8/20/2022         |
      | renewalDate       | 2/20/2025         |
      | subscriptionType  | Basic             |
      | description       | SubscriptionTest  |
    Then I see the "Basic" subscription in the table

  @createProject
  Scenario: Create a project
    Given I see the customer "functional-test-project" in the table
    And I go to the Projects List of "functional-test-project"
    And I open the Add Project form
    When I create a project with the following data
      | name          | projectTest       |
      | code          | PRT-01            |
      | startDate     | 8/20/2022         |
      | subscription  | SubscriptionTest  |
    Then I should see the message "Project added successfully!"
    Then I see the project "projectTest" in the table

  @editProject
  Scenario: Edit a project
    Given I see the customer "functional-test-project" in the table
    And I go to the Projects List of "functional-test-project"
    And I see the project "projectTest" in the table
    When I edit the project "projectTest" with the following data
#      | startDate | 8/20/2022         |
      | name          | projectModified   |
      | code          | PRT-02            |
      | type          | Closed            |
      | closeDate     | 8/30/2022         |
#      | subscription  | SubscriptionTest  |
    Then I should see the message "Project edited successfully!"
    And I should see the modified data in Projects table

  @closeProject
  Scenario: Close a project
    Given I see the customer "functional-test-project" in the table
    And I go to the Projects List of "functional-test-project"
    And I see the project "projectModified" in the table
    When I close the project "projectModified"
    Then I should see the message "Project closed successfully!"
    And I should see the project "projectModified" in the table with a status "Closed"

  @deleteProject
  Scenario: Delete a project
    Given I see the customer "functional-test-project" in the table
    And I go to the Projects List of "functional-test-project"
    And I see the project "projectModified" in the table
    When I delete the project "projectModified"
    Then I should see the message "Project deleted successfully!"

  @deleteCustomerProject @delete
  Scenario: Delete test projects customer
    Given I see the customer "functional-test-project" in the table
    When I delete the customer "functional-test-project"
    Then I should see the message "Customer deleted successfully!"
