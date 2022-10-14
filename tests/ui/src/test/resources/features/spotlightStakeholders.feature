@CTaaSFeature @spotLightStakeholdersTest
Feature: Stakeholders
  Background: Login successfully with valid credentials
    Given I am on the landing page

  @createStakeholderTestCustomer
  Scenario: Create a test customer for stakeholders tests
    Given I try to login with email and password
    And I open the Add Customer form
    When I create a customer with the following data
      | name          | stakeholdersTestCustomer              |
      | type          | MSP                                   |
      | subaccount    | Default                               |
      | spotlight     | yes                                   |
      | testCustomer  | yes                                   |
    Then I see the customer "stakeholdersTestCustomer" in the table

  @addStakeholder
  Scenario: Add a Test Spotlight for customer
    Given I try to login with email and password
    And I see the customer "stakeholdersTestCustomer" in the table
    And I go to the spotlight dashboard for "stakeholdersTestCustomer"
    And I go to the spotlight "Stakeholders" tab
    And I open the Add Stakeholder form
    When I create a stakeholder with the following data
      | name                  | stakeholderTest                |
      | jobTitle              | Manager                        |
      | companyName           | stakeholderCompany             |
      | phoneNumber           | 6524352354                      |
      | type                  | High level                      |
    Then I should see the message "Created Stakeholder successfully"
    And I logout

  @loginStakeholder
  Scenario: Stakeholder login
    Given I try to login with a stakeholder account
    Then I should see the "SpotLight" view
    And I should see the following buttons
      | Dashboard     |

  @editStakeholder
  Scenario: Edit a StakeHolder
    Given I try to login with email and password
    And I see the customer "StakeholdersTestCustomer" in the table
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
    Given I try to login with email and password
    And I see the customer "StakeholdersTestCustomer" in the table
    And I go to the spotlight dashboard for "StakeholdersTestCustomer"
    And I go to the spotlight "Stakeholders" tab
    And I see the "Stakeholder Test Edited" stakeholder in the table
    When I delete the "Stakeholder Test Edited" stakeholder
    Then I should see the message "Deleted Stakeholder successfully"

  @deleteStakeholdersTestCustomer @ignore
  Scenario: Delete the test spotlight customer
    Given I try to login with email and password
    And I see the customer "StakeholdersTestCustomer" in the table
    When I delete the customer "StakeholdersTestCustomer"
    Then I should see the message "Customer deleted successfully!"