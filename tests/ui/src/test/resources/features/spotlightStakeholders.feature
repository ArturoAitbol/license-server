@CTaaSFeature @spotLightStakeholdersTest
Feature: Stakeholders
  Background: Login successfully with valid credentials
    Given I am on the landing page

  @createfunctional-test-stakeholder @test
  Scenario: Create a test customer for stakeholders tests
    Given I try to login using a "FullAdministrator"
    And I open the Add Customer form
    When I create a customer with the following data
      | name          | functional-test-stakeholder           |
      | type          | MSP                               |
      | adminEmail    | test-stakeholder@tekvizion.com    |
      | subaccount    | Default                           |
      | subAdminEmail | test-stakeholder@tekvizion.com    |
      | spotlight     | yes                               |
      | testCustomer  | yes                               |
    Then I see the customer "functional-test-stakeholder" in the table

  @addLicense @test
  Scenario: Add Basic license
    Given I see the customer "functional-test-stakeholder" in the table
    And I go to the Subscriptions view of "functional-test-stakeholder"
    And I should see the "tekVizion 360 Subscriptions" table
    And I open the Add Subscription form
    When I create a subscription with the following data
      | startDate             | 8/20/2022         |
      | renewalDate           | 2/20/2025         |
      | subscriptionType      | Basic             |
      | description           | Description1      |
    Then I see the "Description1" subscription in the table

  @editSpotLight @spotLightDashboard @test
  Scenario: Edit a spotlight setup
    Given I see the customer "functional-test-stakeholder" in the table
    And I go to the spotlight dashboard for "functional-test-stakeholder"
    And I go to the spotlight "Configuration" tab
    When I edit the setup details with the following data
      | azureResourceGroup  | az_tap_rg                                  |
      | tapUrl              | http://tekvizionTap.com                    |
      | status              | READY                                |
    Then I should see the modified data in spotlight configuration view

  @addStakeholder @spotLightDashboard @test
  Scenario: Add a Stakeholder
    Given I see the customer "functional-test-stakeholder" in the table
    And I go to the spotlight dashboard for "functional-test-stakeholder"
    And I go to the spotlight "Stakeholders" tab
    And I open the Add Stakeholder form
    When I create a stakeholder with the following data
      | name          | stakeholderTest         |
      | jobTitle      | Manager                 |
      | companyName   | stakeholderCompany      |
      | phoneNumber   | 6524352354              |
    Then I should see the message "Created Stakeholder successfully"
#    And I logout

  @loginStakeholder @ignore @feature-toggle
  Scenario: Stakeholder login
    Given I try to login using a "Stakeholder"
    Then I should see the "SpotLight" view
    And I should see the following buttons
      | Dashboard     |
    And I logout

  @editStakeholder @feature-toggle @spotLightDashboard
  Scenario: Edit a StakeHolder
    Given I try to login using a "FullAdministrator"
    And I see the customer "functional-test-stakeholder" in the table
    And I go to the spotlight dashboard for "functional-test-stakeholder"
    And I go to the spotlight "Stakeholders" tab
    When I edit the stakeholder "stakeholderTest" with the following data
      | name                  | stakeholderTestModified         |
      | jobTitle              | Senior                          |
      | companyName           | testCompany                     |
      | phoneNumber           | 6524352354                      |
    Then I should see the message "Updated stake holder details successfully"

  @deleteStakeholder @feature-toggle @spotLightDashboard
  Scenario: Delete Stakeholder Test
    Given I see the customer "functional-test-stakeholder" in the table
    And I go to the spotlight dashboard for "functional-test-stakeholder"
    And I go to the spotlight "Stakeholders" tab
    And I see the "stakeholderTestModified" stakeholder in the table
    When I delete the "stakeholderTestModified" stakeholder
    Then I should see the message "Deleted Stakeholder successfully"

  @deleteStakeholdersTestCustomer @delete
  Scenario: Delete the test customer for stakeholder
    Given I see the customer "functional-test-stakeholder" in the table
    When I delete the customer "functional-test-stakeholder"
    Then I should see the message "Customer deleted successfully!"
