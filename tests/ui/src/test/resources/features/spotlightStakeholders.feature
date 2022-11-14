@CTaaSFeature @spotLightStakeholdersTest
Feature: Stakeholders
  Background: Login successfully with valid credentials
    Given I am on the landing page

  @createStakeholderTestCustomer
  Scenario: Create a test customer for stakeholders tests
    Given I try to login using a "FullAdministrator"
    And I open the Add Customer form
    When I create a customer with the following data
      | name          | stakeholderTestCustomer           |
      | type          | MSP                               |
      | adminEmail    | test-stakeholder@tekvizion.com    |
      | subaccount    | Default                           |
      | subAdminEmail | test-stakeholder@tekvizion.com    |
      | spotlight     | yes                               |
      | testCustomer  | yes                               |
    Then I see the customer "stakeholderTestCustomer" in the table

  @addStakeholder
  Scenario: Add a Stakeholder
    Given I see the customer "stakeholderTestCustomer" in the table
    And I go to the spotlight dashboard for "stakeholderTestCustomer"
    And I go to the spotlight "Stakeholders" tab
    And I open the Add Stakeholder form
    When I create a stakeholder with the following data
      | name          | stakeholderTest         |
      | jobTitle      | Manager                 |
      | companyName   | stakeholderCompany      |
      | phoneNumber   | 6524352354              |
      | type          | High level              |
    Then I should see the message "Created Stakeholder successfully"
    And I logout

  @loginStakeholder @login @onBoardTest
  Scenario: Stakeholder login
    Given I try to login using a "Stakeholder"
    Then I should see the "SpotLight" view
    And I should see the following buttons
      | Dashboard     |
    And I logout

  @editStakeholder
  Scenario: Edit a StakeHolder
    Given I try to login using a "FullAdministrator"
    And I see the customer "stakeholderTestCustomer" in the table
    And I go to the spotlight dashboard for "stakeholderTestCustomer"
    And I go to the spotlight "Stakeholders" tab
    When I edit the stakeholder "stakeholderTest" with the following data
      | name                  | stakeholderTestModified         |
      | jobTitle              | Senior                          |
      | companyName           | testCompany                     |
      | phoneNumber           | 6524352354                      |
      | type                  | High level                      |
    Then I should see the message "Updated stake holder details successfully"

  @deleteStakeholder @delete
  Scenario: Delete Stakeholder Test
    Given I see the customer "stakeholderTestCustomer" in the table
    And I go to the spotlight dashboard for "stakeholderTestCustomer"
    And I go to the spotlight "Stakeholders" tab
    And I see the "stakeholderTestModified" stakeholder in the table
    When I delete the "stakeholderTestModified" stakeholder
    Then I should see the message "Deleted Stakeholder successfully"

  @deleteStakeholdersTestCustomer @delete
  Scenario: Delete the test customer for stakeholder
    Given I see the customer "stakeholderTestCustomer" in the table
    When I delete the customer "stakeholderTestCustomer"
    Then I should see the message "Customer deleted successfully!"
