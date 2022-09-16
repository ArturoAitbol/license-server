@licenseConsumptionTest
Feature: LicensesConsumption
  Background: : Login successfully with valid credentials
    Given I am on the landing page
    When I try to login with email and password
    Then I should see the "Customers" page

  @createLicenseConsumptionCustomer
  Scenario: Create a test customer for license consumption tests
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | licenseUsageCustomerTest              |
      | type          | MSP                                   |
      | adminEmail    | test-usage@tekvizion.com              |
      | subaccount    | Default                               |
      | subAdminEmail | test-usage@tekvizion.com              |
      | testCustomer  | yes                                   |
    Then I see the customer "licenseUsageCustomerTest" in the table

  @addLicenseForConsumption
  Scenario: Add a subscription for the tekToken Consumption
    Given I see the customer "licenseUsageCustomerTest" in the table
    And I go to the tekToken Consumption view of "licenseUsageCustomerTest"
    And I open the Add Subscription form from Consumption View
    When I create a subscription with the following data
      | startDate         | 8/20/2022 |
      | renewalDate       | 2/20/2023 |
      | subscriptionType  | Basic     |
      | description       | License1  |
    Then I should see the message "Subscription added successfully!"

  @addLicenseConsumption
  Scenario: Add a tekToken Consumption
    Given I see the customer "licenseUsageCustomerTest" in the table
    And I go to the tekToken Consumption view of "licenseUsageCustomerTest"
    And I open the Add tekToken Consumption form
    And I open the Add Project form from Consumption form
    And I create a project with the following data
      | startDate         | 8/20/2022   |
      | name              | projectTest |
      | code              | PRT-001     |
      | subscription      | License1    |
    And I should see the message "Project added successfully!"
    When I add a consumption with the following data
#      | startWeek         | 8/21/2022     |
#      | endWeek           | 8/27/2022     |
      | project           | projectTest                       |
      | deviceVendor      | Cisco                             |
      | deviceModel       | Contact Center Enterprise (UCCE)  |
      | deviceVersion     | 12.6                              |
      | deviceGranularity | week                              |
      | tekTokens         | 7                                 |
    Then I should see the following data in the tekToken Consumption Summary table
      | tekTokens         | 55      |
    Then I should see the following data in the tekTokens Project Consumption table
#      | project           | projectTest   |
      | status            | Open          |
    And I should see the same data in the tekToken Consumption Events table

  @editLicenseConsumption
  Scenario: Edit a tekToken Consumption
    Given I see the customer "licenseUsageCustomerTest" in the table
    And I go to the tekToken Consumption view of "licenseUsageCustomerTest"
    When I edit the consumption of the project "projectTest" with the following data
      | deviceVendor      | Cisco                         |
      | deviceModel       | Contact Center Express (UCCX) |
      | deviceVersion     | 12.5                          |
      | deviceGranularity | week                          |
      | tekTokens         | 4                             |
    Then I should see the message "tekToken consumption successfully edited!"
    Then I should see the following data in the tekToken Consumption Summary table
      | tekTokens         | 55            |
    Then I should see the following data in the tekTokens Project Consumption table
      | project           | projectTest   |
      | status            | Open          |
    And I should see the same data in the tekToken Consumption Events table

  @deleteLicenseConsumption
  Scenario: Delete a tekToken Consumption
    Given I see the customer "licenseUsageCustomerTest" in the table
    And I go to the tekToken Consumption view of "licenseUsageCustomerTest"
    When I delete the consumption of the project "projectTest"

  @deleteCustomerProject
  Scenario: Delete the test licenses customer
    Given I see the customer "licenseUsageCustomerTest" in the table
    When I delete the customer "licenseUsageCustomerTest"
    Then I should see the message "Customer deleted successfully!"