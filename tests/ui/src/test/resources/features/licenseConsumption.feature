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
      | adminEmail    | test-usage@tekvizionlabs.com          |
      | subaccount    | Default                               |
      | subAdminEmail | usage-subaccount@tekvizionlabs.com    |
      | testCustomer  | yes                                   |
    Then I see the customer "licenseUsageCustomerTest" in the table

  @addLicenseForConsumption
  Scenario: Add a package for the tekToken Consumption
    Given I see the customer "licenseUsageCustomerTest" in the table
    And I go to the Package Consumption view of "licenseUsageCustomerTest"
    And I open the Add Package form from Consumption View
    When I create a package with the following data
      | startDate     | 8/20/2022 |
      | renewalDate   | 2/20/2023 |
      | packageType   | Basic     |
      | description   | License1  |
    Then I should see the message "Package added successfully!"

  @addLicenseConsumption
  Scenario: Add a tekToken Consumption
    Given I see the customer "licenseUsageCustomerTest" in the table
    And I go to the Package Consumption view of "licenseUsageCustomerTest"
    And I open the Add tekToken Consumption form
    And I open the Add Project form from Consumption form
    And I create a project with the following data
      | startDate | 8/17/2022   |
      | name      | projectTest |
      | code      | PRT-001     |
      | license   | License1    |
    And I should see the message "Project added successfully!"
    When I add a consumption with the following data
      | startDate           | 8/21/2022     |
      | endDate             | 8/27/2022     |
      | project             | projectTest   |
      | deviceVendor        | Adtran        |
      | deviceModel         | 908E          |
      | deviceVersion       | R13.3.0.E     |
      | deviceGranularity   | week          |
      | tekTokens           | 1             |
    Then I should see the following data in the tekTokens Consumption view
      | tekTokens     | 55      |
#      | consumed      | 1       |
#      | available     | 54      |
    Then I should see the following data in the tekTokens Project Consumption table
#      | project     | projectTest   |
      | status      | Open          |
#      | tekTokens   | 1             |
    And I should see the same data in the tekTokens Consumption Events table

  @editLicenseConsumption
  Scenario: Edit a tekToken Consumption
    Given I see the customer "licenseUsageCustomerTest" in the table
    And I go to the Package Consumption view of "licenseUsageCustomerTest"
    When I edit the consumption of the project "projectTest" with the following data
      | deviceVendor        | 3CX         |
      | deviceModel         | 3CX         |
      | deviceVersion       | 18.0.1880   |
      | deviceGranularity   | week        |
      | tekTokens           | 2           |
    Then I should see the message "tekToken consumption successfully edited!"
    Then I should see the following data in the tekTokens Consumption Summary table
      | tekTokens     | 55      |
#      | consumed      | 2       |
#      | available     | 53      |
    Then I should see the following data in the tekTokens Project Consumption table
#      | project     | projectTest   |
      | status      | Open          |
#      | tekTokens   | 2             |
    And I should see the same data in the tekTokens Consumption Events table

  @deleteLicenseConsumption
  Scenario: Delete a tekToken Consumption
    Given I see the customer "licenseUsageCustomerTest" in the table
    And I go to the Package Consumption view of "licenseUsageCustomerTest"
    When I delete the consumption of the project "projectTest"

  @deleteCustomerProject
  Scenario: Delete the test licenses customer
    Given I see the customer "licenseUsageCustomerTest" in the table
    When I delete the customer "licenseUsageCustomerTest"
    Then I should see the message "Customer deleted successfully!"