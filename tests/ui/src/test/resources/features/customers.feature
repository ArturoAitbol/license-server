@customersTest @license
Feature: Customers
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page

  @createTestCustomer
  Scenario: Create a test customer
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | functional-test-customer          |
      | type          | Reseller                          |
      | adminEmail    | test-customer@tekvizion.com       |
      | subaccount    | subaccountTest                    |
      | subAdminEmail | test-customer@tekvizion.com       |
      | testCustomer  | yes                               |
    Then I see the customer "functional-test-customer" in the table
    And I verify "customer" admin emails

  @addCustomerAdmin
  Scenario: Add a customer administrator
    Given I see the customer "functional-test-customer" in the table
    And I open the Customer Administrator Emails of "functional-test-customer"
    When I add an administrator with email "admintest@tekvizion.com"
    Then I should see the message "Customer admin emails edited successfully!"
    And I verify "customer" admin emails

  @subscriptionsView @CTaaSFeature
  Scenario: Go to the subscriptions tab
    Given I see the customer "functional-test-customer" in the table
    When I go to dashboard "Subscriptions" tab
    Then I should see the "Subscriptions Overview" page
    And I should see the "name-label" placeholder
    And I should see the "subscription-label" placeholder
    And I should see the "date-label" placeholder

  @deleteCustomerAdmin
  Scenario: Delete a customer administrator
    Given I see the customer "functional-test-customer" in the table
    And I open the Customer Administrator Emails of "functional-test-customer"
    When I delete administrator with email "admintest@tekvizion.com"
    Then I should see the message "Customer administrator email deleted"

  @editCustomer
  Scenario: Edit a test customer
    Given I see the customer "functional-test-customer" in the table
    When I edit the customer "functional-test-customer" with the following data
      | name          | functional-license-customer    |
      | type          | MSP                            |
      | subaccount    | subCustomModified              |
    Then I should see the message "Customer and subaccount edited successfully!"
    And I should see the modified data in Customers table