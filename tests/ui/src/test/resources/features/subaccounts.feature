@subaccountsTest @license
Feature: Subaccounts
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"

  @createSubaccount @create
  Scenario: Create a subaccount
    Given I see the customer "functional-license-customer" in the table
    And I open the Add Subaccount form
    When I create a subaccount with the following data
      | customer      | functional-license-customer          |
      | name          | subaccountTest                      |
      | subAdminEmail | test-sub-custom@tekvizion.com       |
    Then I should see the message "Subaccount added successfully!"
    Then I see in the table the customer "functional-license-customer" and its subaccount "subaccountTest"
    And I verify "subaccount" admin emails

  @addSubaccountAdmin @create
  Scenario: Add a subaccount administrator
    Given I see in the table the customer "functional-license-customer" and its subaccount "subaccountTest"
    And I open the Subaccount Administrator Emails of "functional-license-customer"
    When I add an administrator with email "subadmintest@tekvizion.com"
    Then I should see the message "Subaccount admin emails edited successfully!"
    And I verify "subaccount" admin emails

  @deleteSubaccountAdmin @delete
  Scenario: Delete a subaccount administrator
    Given I see in the table the customer "functional-license-customer" and its subaccount "subaccountTest"
    And I open the Subaccount Administrator Emails of "functional-license-customer"
    When I delete administrator with email "subadmintest@tekvizion.com"
    Then I should see the message "Subaccount administrator email deleted"

  @editSubaccount
  Scenario: Edit a subaccount
    Given I see in the table the customer "functional-license-customer" and its subaccount "subaccountTest"
    When I edit the customer "functional-license-customer" with the following data
      | name          | functional-license-customer-modified |
      | type          | MSP                                   |
      | subaccount    | subaccountModified                    |
    Then I should see the message "Customer and subaccount edited successfully!"
    And I should see the modified data in Subaccounts table

  @deleteSubaccount @delete
  Scenario: Delete a subaccount
    Given I see in the table the customer "functional-license-customer-modified" and its subaccount "subaccountModified"
    When I delete the subaccount "subaccountModified" of the customer "functional-license-customer-modified"
    Then I should see the message "Subaccount deleted successfully!"

  @deleteSubaccountCustomer @delete
  Scenario: Delete the test subaccount customer
    Given I see the customer "functional-license-customer-modified" in the table
    When I delete the customer "functional-license-customer-modified"
    Then I should see the message "Customer deleted successfully!"
