@CTaaSFeature @spotLightStakeholdersTest
Feature: Stakeholders
  Background: Login successfully with valid credentials
    Given I am on the landing page

  @addLicense @test
  Scenario: Add Basic license
    Given I see the customer "functional-spotlight-customer" in the table
    And I go to the Subscriptions view of "functional-spotlight-customer"
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
    Given I see the customer "functional-spotlight-customer" in the table
    And I go to the spotlight dashboard for "functional-spotlight-customer"
    And I go to the spotlight "Configuration" tab
    When I edit the setup details with the following data
      | azureResourceGroup  | az_tap_rg                            |
      | tapUrl              | http://tekvizionTap.com              |
      | status              | READY                                |
    Then I should see the modified data in spotlight configuration view

  @addStakeholder @spotLightDashboard @test
  Scenario: Add a Stakeholder
    Given I see the customer "functional-spotlight-customer" in the table
    And I go to the spotlight dashboard for "functional-spotlight-customer"
    And I go to the spotlight "Stakeholders" tab
    And I open the Add Stakeholder form
    When I create a stakeholder with the following data
      | name                | stakeholderTest       |
      | countryPhoneNumber  | Canada                |
      | phoneNumber         | 4168501924            |
      | companyName         | stakeholderCompany    |
      | jobTitle            | Manager               |
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
    And I see the customer "functional-spotlight-customer" in the table
    And I go to the spotlight dashboard for "functional-spotlight-customer"
    And I go to the spotlight "Stakeholders" tab
    When I edit the stakeholder with the email "test-functional-subaccount-stakeholder@tekvizion360.com" using the following data
      | name                | stakeholderTest         |
      | countryPhoneNumber  | Andorra                 |
      | phoneNumber         | 712345                  |
      | companyName         | testCompany             |
      | jobTitle            | Senior                  |
    Then I should see the message "Updated stake holder details successfully"

  @deleteStakeholder @spotLightDashboard
  Scenario: Delete a Stakeholder
    Given I see the customer "functional-spotlight-customer" in the table
    And I go to the spotlight dashboard for "functional-spotlight-customer"
    And I go to the spotlight "Stakeholders" tab
    And I see a stakeholder with the email "test-functional-subaccount-stakeholder@tekvizion360.com" in the table
    When I delete the stakeholder with the email "test-functional-subaccount-stakeholder@tekvizion360.com"
    Then I should see the message "Deleted Stakeholder successfully"