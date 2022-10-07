@spotLightStakeholdersTest
Feature: Stakeholders
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login with email and password
    Then I should see the "Customers" page
    
  @createStakeholderTestCustomer
  Scenario: Create a test customer for stakeholders tests
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | StakeholdersTestCustomer              |
      | type          | MSP                                   |
      | adminEmail    | spotlight-test-sh@tekvizion.com       |
      | subaccount    | Default                               |
      | subAdminEmail | spotlight-test-sh-sa@tekvizion.com    |
      | spotlight     | yes                                   |
      | testCustomer  | yes                                   |
    Then I see the customer "StakeholdersTestCustomer" in the table

  @addStakeholder
  Scenario: Add a Test Spotlight for customer
    Given I see the customer "StakeholdersTestCustomer" in the table
    And I go to the spotlight dashboard for "StakeholdersTestCustomer"
    And I go to the spotlight "Stakeholders" tab
    And I open the Add Stakeholder form
    When I create a stakeholder with the following data
      | name                  | Stakeholder Test                |
      | jobTitle              | Stakeholder Job                 |
      | companyName           | Stakeholder Company             |
      | subaccountAdminEmail  | email@tekvizion.com             |
      | phoneNumber           | 6524352354                      |
      | type                  | High level                      |
    Then I should see the message "Created Stakeholder successfully"

  @editStakeholder
  Scenario: Edit a StakeHolder
    Given I see the customer "StakeholdersTestCustomer" in the table
    And I go to the spotlight dashboard for "StakeholdersTestCustomer"
    And I go to the spotlight "Stakeholders" tab
    When I edit the stakeholder "Stakeholder Test" with the following data
      | name                  | Stakeholder Test Edited         |
      | jobTitle              | Stakeholder Job                 |
      | companyName           | Stakeholder Company             |
      | phoneNumber           | 6524352354                      |
      | type                  | High level                      |
    Then I should see the message "Updated stake holder details successfully"

  @deleteStakeholder
  Scenario: Delete Stakeholder Test 
      Given I see the customer "StakeholdersTestCustomer" in the table
      And I go to the spotlight dashboard for "StakeholdersTestCustomer"
      And I go to the spotlight "Stakeholders" tab
      And I see the "Stakeholder Test Edited" stakeholder in the table
      When I delete the "Stakeholder Test Edited" stakeholder
      Then I should see the message "Deleted Stakeholder successfully"

  @deleteStakeholdersTestCustomer @ignore
  Scenario: Delete the test spotlight customer
    Given I see the customer "StakeholdersTestCustomer" in the table
    When I delete the customer "StakeholdersTestCustomer"
    Then I should see the message "Customer deleted successfully!"