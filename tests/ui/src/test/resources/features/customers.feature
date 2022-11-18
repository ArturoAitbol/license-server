@customersTest
Feature: Customers
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page

  @createTestCustomer
  Scenario: Create a test customer
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | customerTest                      |
      | type          | Reseller                          |
      | adminEmail    | test-customer@tekvizion.com       |
      | subaccount    | subaccountTest                    |
      | subAdminEmail | test-customer@tekvizion.com       |
      | testCustomer  | yes                               |
    Then I see the customer "customerTest" in the table

  @addCustomerAdmin
  Scenario: Add a customer administrator
    Given I see the customer "customerTest" in the table
    And I open the Customer Administrator Emails of "customerTest"
    When I add an administrator with email "admintest@tekvizion.com"
    Then I should see the message "Customer admin emails edited successfully!"

  @subscriptionsView @CTaaSFeature
  Scenario: Go to the subcriptions tab
    Given I see the customer "customerTest" in the table
    When I go to dashboard "Subscriptions" tab
    Then I should see the "Subscriptions Overview" page
    And I should see the "name-label" placeholder
    And I should see the "subscription-label" placeholder
    And I should see the "date-label" placeholder

  @deleteCustomerAdmin
  Scenario: Delete a customer administrator
    Given I see the customer "customerTest" in the table
    And I open the Customer Administrator Emails of "customerTest"
    When I delete the administrator with email "admintest@tekvizion.com"
    Then I should see the message "Customer administrator email deleted"

  @editCustomer
  Scenario: Edit a test customer
    Given I see the customer "customerTest" in the table
    When I edit the customer "customerTest" with the following data
      | name          | customerModified        |
      | type          | MSP                     |
      | subaccount    | subCustomModified       |
    Then I should see the message "Customer and subaccount edited successfully!"
    And I should see the modified data in Customers table

  @deleteCustomer @delete
  Scenario: Delete a test customer
    Given I see the customer "customerModified" in the table
    When I delete the customer "customerModified"
    Then I should see the message "Customer deleted successfully!"
