@customersTest
Feature: Customers
  Background: : Login successfully with valid credentials
    Given I am on the landing page
    When I try to login with email and password
    Then I should see the "Customers" page

  @createCustomer
  Scenario: Create a test customer
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | customerTest                      |
      | type          | Reseller                          |
      | adminEmail    | test-customer@tekvizionlabs.com   |
      | subaccount    | subaccountTest                    |
      | subAdminEmail | test-customer@tekvizionlabs.com   |
      | testCustomer  | yes                               |
    Then I should see the message "Customer added successfully!"
    Then I see the customer "customerTest" in the table

  @editCustomer
  Scenario: Edit a test customer
    Given I see the customer "customerTest" in the table
    When I edit the customer "customerTest" with the following data
      | name          | customerModified        |
      | type          | MSP                     |
      | subaccount    | subaccountModified      |
    Then I should see the message "Customer and subaccount edited successfully!"
    And I should see the modified data in Customers table

  @deleteCustomer
  Scenario: Delete a test customer
    Given I see the customer "customerModified" in the table
    When I delete the customer "customerModified"
    Then I should see the message "Customer deleted successfully!"
