@CTaaSFeature @spotLightSetupTest
Feature: CtaasSetup
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page

  @createSpotLightCustomer @spotLightStakeholdersTest
  Scenario: Create a test customer for spotlight setup tests
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | functional-spotlight-customer          |
      | type          | MSP                                   |
      | adminEmail    | spotlight-test-setup@tekvizion.com    |
      | subaccount    | Default                               |
      | subAdminEmail | spotlight-test-setup@tekvizion.com    |
      | spotlight     | yes                                   |
      | testCustomer  | yes                                   |
    Then I see the customer "functional-spotlight-customer" in the table

  @addLicense @spotLightStakeholdersTest
  Scenario: Add Basic license
    Given I see the customer "functional-spotlight-customer" in the table
    And I go to the Subscriptions view of "functional-spotlight-customer"
    And I should see the "TekVizion 360 Subscriptions" table
    And I open the Add Subscription form
    When I create a subscription with the following data
      | startDate             | 8/20/2022         |
      | renewalDate           | 2/20/2025         |
      | subscriptionType      | Basic             |
      | description           | Description1      |
    Then I see the "Description1" subscription in the table

  @editSpotLight @spotLightDashboard @spotLightStakeholdersTest
  Scenario: Edit a spotlight setup
    Given I see the customer "functional-spotlight-customer" in the table
    And I go to the spotlight dashboard for "functional-spotlight-customer"
    And I go to the spotlight "Configuration" tab
    When I edit the setup details with the following data
      | azureResourceGroup  | az_tap_rg                                  |
      | tapUrl              | https://tekvizion-ap-spotlight-dan-env-01.eastus2.cloudapp.azure.com:8443/onPOINT   |
      | status              | READY                                      |
    And I add the following support emails
      | test-1@example.com |
      | test-2@example.com |
    Then I should see the modified data in spotlight configuration view
    #And I should see the following emails in the support emails section
    #  | test-1@example.com |
    #  | test-2@example.com |

  @verifyLicenseConsumption
  Scenario: Verify license consumption created by spotlight setup
    Given I see the customer "functional-spotlight-customer" in the table
    When I go to the tekToken Consumption view of "functional-spotlight-customer"
    Then I should see the following data in the tekTokens Project Consumption table
      | project           | SpotLight Project  |
      | status            | Open               |
      | tekTokens         | 0                  |
    And I should see the following data in the tekToken Consumption Events table
      | project           | SpotLight Project                          |
      | device            | tekVizion - Base SpotLight platform ready  |
      | tekTokensUsed     | 0                                          |