@onBoardTest
Feature: Customers
  Background: Login successfully with valid credentials
    Given I am on the landing page

  @createSubAdminCustomer
  Scenario: Create a test customer for subaccount admin
    Given I try to login with email and password
    And I open the Add Customer form
    When I create a customer with the following data
      | name          | subAdminCustomerTest                              |
      | type          | Reseller                                          |
      | adminEmail    | test-functional-subaccount-admin@tekvizion360.com |
      | subaccount    | subAdminTest                                      |
      | subAdminEmail | test-functional-subaccount-admin@tekvizion360.com |
      | spotlight     | yes                                               |
      | testCustomer  | yes                                               |
    Then I see the customer "subAdminCustomerTest" in the table
    And I logout

  @rejectOnBoard @test
  Scenario: Reject On Board Wizard
    Given I try to login with a subaccount administrator
    When I click on "Not right now" button
    Then I should see the logout page

  @completeOnBoard @test
  Scenario: Complete On Board Wizard
    Given I try to login with a subaccount administrator
    When I click on "Sure. Let's do it!" button
    And I fill the on board wizard with the following data
      | name            | test-functional-subaccount-admin                  |
      | jobTitle        | Manager                                           |
      | email           | test-functional-subaccount-admin@tekvizion360.com |
      | company         | TestComp                                          |
      | phoneNumber     | +12064563059                                      |
      | type            | Detailed                                          |
      | dailyReports    | yes                                               |
      | weeklyReports   | yes                                               |
      | monthlyReports  | yes                                               |
    Then I click on "No, I'm done" button