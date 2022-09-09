@subaccountsTest
Feature: Subaccounts
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login with email and password

  @createSubaccountCustomer
  Scenario: Create a test customer for subaccounts tests
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | subaccountCustomerTest              |
      | type          | MSP                                 |
      | adminEmail    | test-sub-custom@tekvizionlabs.com   |
      | subaccount    | Default                             |
      | subAdminEmail | test-subaccount+1@tekvizionlabs.com |
      | testCustomer  | yes                                 |
    Then I see the customer "subaccountCustomerTest" in the table

  @createSubaccount
  Scenario: Create a subaccount
    Given I see the customer "subaccountCustomerTest" in the table
    And I open the Add Subaccount form
    When I create a subaccount with the following data
      | customer      | subaccountCustomerTest              |
      | name          | subaccountTest                      |
      | subAdminEmail | test-subaccount+2@tekvizionlabs.com |
    Then I should see the message "Subaccount added successfully!"
    Then I see in the table the customer "subaccountCustomerTest" and its subaccount "subaccountTest"

  @addSubaccountAdmin
  Scenario: Add a subaccount administrator
    Given I see in the table the customer "subaccountCustomerTest" and its subaccount "subaccountTest"
    And I open the Subaccount Administrator Emails of "subaccountCustomerTest"
    When I add an administrator with email "admintest@tekvizionlabs.com"
    Then I should see the message "Customer admin emails edited successfully!"

  @deleteSubaccountAdmin
  Scenario: Delete a subaccount administrator
    Given I see in the table the customer "subaccountCustomerTest" and its subaccount "subaccountTest"
    And I open the Subaccount Administrator Emails of "subaccountCustomerTest"
    When I delete the administrator with email "admintest@tekvizionlabs.com"
    Then I should see the message "Subaccount administrator email deleted"

  @editSubaccount
  Scenario: Edit a subaccount
    Given I see in the table the customer "subaccountCustomerTest" and its subaccount "subaccountTest"
    When I edit the customer "subaccountCustomerTest" with the following data
      | name          | subCustomTest           |
      | type          | MSP                     |
      | subaccount    | subaccountModified      |
    Then I should see the message "Customer and subaccount edited successfully!"
    And I should see the modified data in Subaccounts table

  @deleteSubaccount
  Scenario: Delete a subaccount
    Given I see in the table the customer "subCustomTest" and its subaccount "subaccountModified"
    When I delete the subaccount "subaccountModified" of the customer "subCustomTest"
    Then I should see the message "Subaccount deleted successfully!"

  @deleteSubaccountCustomer
  Scenario: Delete the test subaccount customer
    Given I see the customer "subCustomTest" in the table
    When I delete the customer "subCustomTest"
    Then I should see the message "Customer deleted successfully!"
