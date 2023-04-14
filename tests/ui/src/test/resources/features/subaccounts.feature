@subaccountsTest
Feature: Subaccounts
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"

  @createSubaccountCustomer @create
  Scenario: Create a test customer for subaccounts tests
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | functional-test-subaccount          |
      | type          | MSP                                 |
      | adminEmail    | test-subaccount@tekvizion.com       |
      | subaccount    | Default                             |
      | subAdminEmail | test-subaccount@tekvizion.com       |
      | testCustomer  | yes                                 |
    Then I see the customer "functional-test-subaccount" in the table

  @createSubaccount @create
  Scenario: Create a subaccount
    Given I see the customer "functional-test-subaccount" in the table
    And I open the Add Subaccount form
    When I create a subaccount with the following data
      | customer      | functional-test-subaccount              |
      | name          | subaccountTest                      |
      | subAdminEmail | test-sub-custom@tekvizion.com       |
    Then I should see the message "Subaccount added successfully!"
    Then I see in the table the customer "functional-test-subaccount" and its subaccount "subaccountTest"

  @addSubaccountAdmin
  Scenario: Add a subaccount administrator
    Given I see in the table the customer "functional-test-subaccount" and its subaccount "subaccountTest"
    And I open the Subaccount Administrator Emails of "functional-test-subaccount"
    When I add an administrator with email "subadmintest@tekvizion.com"
    Then I should see the message "Subaccount admin emails edited successfully!"

  @deleteSubaccountAdmin @delete
  Scenario: Delete a subaccount administrator
    Given I see in the table the customer "functional-test-subaccount" and its subaccount "subaccountTest"
    And I open the Subaccount Administrator Emails of "functional-test-subaccount"
    When I delete the subaccount administrator with email "subadmintest@tekvizion.com"
    Then I should see the message "Subaccount administrator email deleted"

  @editSubaccount
  Scenario: Edit a subaccount
    Given I see in the table the customer "functional-test-subaccount" and its subaccount "subaccountTest"
    When I edit the customer "functional-test-subaccount" with the following data
      | name          | functional-test-subaccount-modified           |
      | type          | MSP                     |
      | subaccount    | subaccountModified      |
    Then I should see the message "Customer and subaccount edited successfully!"
    And I should see the modified data in Subaccounts table

  @deleteSubaccount @delete
  Scenario: Delete a subaccount
    Given I see in the table the customer "functional-test-subaccount-modified" and its subaccount "subaccountModified"
    When I delete the subaccount "subaccountModified" of the customer "functional-test-subaccount-modified"
    Then I should see the message "Subaccount deleted successfully!"

  @deleteSubaccountCustomer @delete
  Scenario: Delete the test subaccount customer
    Given I see the customer "functional-test-subaccount-modified" in the table
    When I delete the customer "functional-test-subaccount-modified"
    Then I should see the message "Customer deleted successfully!"
