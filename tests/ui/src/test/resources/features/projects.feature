@projectsTest @license
Feature: Projects
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"

  @addLicense
  Scenario: Add a subscription for projects
    Given I see the customer "functional-license-customer" in the table
    And I go to the Subscriptions view of "functional-license-customer"
    And I should see the "TekVizion 360 Subscriptions" table
    And I open the Add Subscription form
    When I create a subscription with the following data
      | startDate         | 8/20/2022         |
      | renewalDate       | 2/20/2025         |
      | subscriptionType  | Basic             |
      | description       | SubscriptionTest  |
    Then I see the "Basic" subscription in the table

  @createProject
  Scenario: Create a project
    Given I see the customer "functional-license-customer" in the table
    And I go to the Projects List of "functional-license-customer"
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
    Given I see the customer "functional-license-customer" in the table
    And I go to the Projects List of "functional-license-customer"
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
    Given I see the customer "functional-license-customer" in the table
    And I go to the Projects List of "functional-license-customer"
    And I see the project "projectModified" in the table
    When I close the project "projectModified"
    Then I should see the message "Project closed successfully!"
    And I should see the project "projectModified" in the table with a status "Closed"

  @deleteProject
  Scenario: Delete a project
    Given I see the customer "functional-license-customer" in the table
    And I go to the Projects List of "functional-license-customer"
    And I see the project "projectModified" in the table
    When I delete the project "projectModified"
    Then I should see the message "Project deleted successfully!"
