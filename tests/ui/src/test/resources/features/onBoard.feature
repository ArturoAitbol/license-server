@CTaaSFeature @onBoardTest @feature-toggle
Feature: OnBoard
  Background: Login successfully with valid credentials
    Given I am on the landing page

  @createSubAdminCustomer
  Scenario: Create a test customer for subaccount admin
    Given I try to login using a "FullAdministrator"
    And I open the Add Customer form
#    When I create a spotlight customer with the following data
    When I create a customer with the following data
      | name          | subAdminCustomerTest                              |
      | type          | Reseller                                          |
      | subaccount    | subAdminTest                                      |
      | spotlight     | yes                                               |
      | testCustomer  | yes                                               |
    Then I see the customer "subAdminCustomerTest" in the table
    And I logout

  @rejectOnBoard @login
  Scenario: Reject On Board Wizard
    Given I try to login using a "SubaccountAdministrator"
    When I click on "Not right now" button
    Then I should see the logout page

  @completeOnBoard @login
  Scenario: Complete On Board Wizard
    Given I try to login using a "SubaccountAdministrator"
    When I click on "Sure. Let's do it!" button
    And I fill the on board wizard with the following data
      | name            | test-functional-subaccount-admin                  |
      | jobTitle        | Manager                                           |
      | company         | TestComp                                          |
      | phoneNumber     | +12064563059                                      |
    Then I click on "No, I'm done" button
    And I logout

  @spotLightNavigation @login
  Scenario: Test SpotLight Navigation
    Given I try to login using a "SubaccountAdministrator"
    And I am on the apps view
    When I click on "Spotlight" button
    Then I should see the "Spotlight" view
    And I should see the following buttons
      | Dashboard     |
      | Stakeholders  |
#    And I logout

  @tokenNavigation @login
  Scenario: Test tekToken Usage Navigation
    Given I am on the apps view
    When I click on "tekToken Usage" button
    And I should see the "tekVizion 360 Portal" view
    And I click on "tekVizion" button
    Then I am on the apps view
    And I logout

  @deleteCustomer @delete
  Scenario: Delete a test customer
    Given I try to login using a "FullAdministrator"
    And I see the customer "subAdminCustomerTest" in the table
    When I delete the customer "subAdminCustomerTest"
    Then I should see the message "Customer deleted successfully!"