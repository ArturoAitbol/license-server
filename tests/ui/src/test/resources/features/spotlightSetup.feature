@CTaaSFeature @spotLightSetupTest
Feature: CtaasSetup
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page

  @createSpotLightCustomer
  Scenario: Create a test customer for spotlight setup tests
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | functional-test-spotlight             |
      | type          | MSP                                   |
      | adminEmail    | spotlight-test-setup@tekvizion.com    |
      | subaccount    | Default                               |
      | subAdminEmail | spotlight-test-setup@tekvizion.com    |
      | spotlight     | yes                                   |
      | testCustomer  | yes                                   |
    Then I see the customer "functional-test-spotlight" in the table

  @addLicense
  Scenario: Add Basic license
    Given I see the customer "functional-test-spotlight" in the table
    And I go to the Subscriptions view of "functional-test-spotlight"
    And I should see the "tekVizion 360 Subscriptions" table
    And I open the Add Subscription form
    When I create a subscription with the following data
      | startDate             | 8/20/2022         |
      | renewalDate           | 2/20/2025         |
      | subscriptionType      | Basic             |
      | description           | Description1      |
    Then I see the "Description1" subscription in the table

  @editSpotLight @spotLightDashboard
  Scenario: Edit a spotlight setup
    Given I see the customer "functional-test-spotlight" in the table
    And I go to the spotlight dashboard for "functional-test-spotlight"
    And I go to the spotlight "Configuration" tab
    When I edit the setup details with the following data
      | azureResourceGroup  | az_tap_rg                                  |
      | tapUrl              | http://tekvizionTap.com                    |
      | status              | READY                                |
    Then I should see the modified data in spotlight configuration view

  @verifyLicenseConsumption
  Scenario: Verify license consumption created by spotlight setup
    Given I see the customer "functional-test-spotlight" in the table
    When I go to the tekToken Consumption view of "functional-test-spotlight"
    Then I should see the following data in the tekTokens Project Consumption table
      | project           | SpotLight Project  |
      | status            | Open               |
      | tekTokens         | 0                  |
    And I should see the following data in the tekToken Consumption Events table
      | project           | SpotLight Project             |
      # need to improve this tests
      #| device            | tekVizion - Base SpotLight platform ready               |
      #| model             | Base SpotLight platform ready |
      | tekTokensUsed     | 0                             |

  @deleteSpotLightCustomer @delete
  Scenario: Delete test spotlightSetup customer
    Given I see the customer "functional-test-spotlight" in the table
    When I delete the customer "functional-test-spotlight"
    Then I should see the message "Customer deleted successfully!"
