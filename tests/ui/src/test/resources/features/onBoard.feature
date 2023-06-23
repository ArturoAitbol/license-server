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
      | name          | functional-spotlight-customer                          |
      | type          | Reseller                                          |
      | adminEmail    | test-functional-subaccount-admin@tekvizion360.com |
      | subaccount    | subAdminTest                                      |
      | subAdminEmail | test-functional-subaccount-admin@tekvizion360.com |
      | spotlight     | yes                                               |
      | testCustomer  | yes                                               |
    Then I see the customer "functional-spotlight-customer" in the table
    And I logout

  @rejectOnBoard @login
  Scenario: Reject On Board Wizard
    Given I try to login using a "SubaccountAdministrator"
    When I click on "Not right now" button
    Then I should see the logout page

  @completeOnBoard @login
  Scenario: Complete On Board Wizard
    Given I try to login using a "SubaccountAdministrator"
    When I click on "Sure!" button
    And I fill the on board wizard with the following data
      | name                | test-functional-subaccount-admin                  |
      | company             | TestComp                                          |
      | countryPhoneNumber  | Canada                                            |
      | phoneNumber         | 4168501924                                        |
      | jobTitle            | Manager                                           |
    Then I click on "No, I'm done" button

  @tokenNavigation @login
  Scenario: Test tekToken Usage Navigation
    Given I am on the apps view
    When I click on "tekToken Usage" button
    And I should see the "TekVizion 360 Portal" view
    And I click on "TekVizion" button
    Then I am on the apps view

  @spotLightNavigation
  Scenario: Test SpotLight Navigation
    Given I am on the apps view
    When I click on "UCaaS Continuous Testing" button
    Then I should see the "UCaaS Continuous Testing" view
    And I should see the following buttons
      | Dashboard     |
      | Notes         |
      | Stakeholders  |
      | Test Reports  |
      | Request Call  |
    And I logout

  @deleteCustomer @delete
  Scenario: Delete a test customer
    Given I try to login using a "FullAdministrator"
    And I see the customer "functional-spotlight-customer" in the table
    When I delete the customer "functional-spotlight-customer"
    Then I should see the message "Customer deleted successfully!"