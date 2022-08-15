@customersTest
Feature: Customers

  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login with email and password

  @createCustomer
  Scenario: Create a test customer
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | customerTest                  |
      | type          | Reseller                      |
      | adminEmail    | test-admin@tekvizionlabs.com  |
      | subaccount    | subaccountTest                |
#      | subaccount    | Default                     |
      | subAdminEmail | test-admin@tekvizionlabs.com  |
      | testCustomer  | yes                           |
    Then I see the customer "customerTest" in the table
#    And I should see the message "Customer and subaccount edited successfully!"

  @deleteCustomer
  Scenario: Delete a test customer
    Given I see the customer "customerTest" in the table
    When I delete the customer "customerTest"
    Then I should see the message "Customer added successfully!"

  @editCustomer
  Scenario: Edit a test customer
    Given I see the customer "customerTest" in the table
    When I edit the customer "customerTest" with the following data
      | name          | customerModified        |
      | type          | MSP                     |
      | subaccount    | subaccountModified      |
    Then I should see the modified data in Customers table
    And I should see the message "Customer and subaccount edited successfully!"
