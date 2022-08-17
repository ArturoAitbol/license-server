@subaccountsTest
Feature: Subaccounts

  Background: : Login successfully with valid credentials
    Given I am on the landing page
    When I try to login with email and password

  @createSubaccount
  Scenario: Create a subaccount
    Given I see the customer "Test NoDistributor" in the table
    And I open the Add Subaccount form
    When I create a subaccount with the following data
      | customer      | Test NoDistributor              |
      | name          | subTest                         |
      | subAdminEmail | test-subadmin@tekvizionlabs.com |
    Then I see in the table the customer "Test NoDistributor" and its subaccount "subTest"

  @editSubaccount
  Scenario: Edit a subaccount
    Given I see in the table the customer "Test Customer" and its subaccount "Default"
    When I edit the customer "Test Customer" with the following data
      | name          | Test Customer           |
      | type          | MSP                     |
      | subaccount    | subaccountModified      |
    Then I should see the modified data in Customers table
    And I should see the message "Customer and subaccount edited successfully!"

  @deleteSubaccount
  Scenario: Delete a subaccount
    Given I see in the table the customer "Test NoDistributor" and its subaccount "subTest"
    When I delete the subaccount "subTest" of the customer "Test NoDistributor"
    Then I should see the message "Subaccount deleted successfully!"