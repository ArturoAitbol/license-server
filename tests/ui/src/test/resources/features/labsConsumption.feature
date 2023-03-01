@labsConsumptionTest
Feature: LicensesConsumption
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page

  @createLabsConsumptionCustomer
  Scenario: Create a test customer for labs consumption tests
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | functional-test-license-usage         |
      | type          | MSP                                   |
      | adminEmail    | test-usage@tekvizion.com              |
      | subaccount    | Default                               |
      | subAdminEmail | test-usage@tekvizion.com              |
      | testCustomer  | yes                                   |
    Then I see the customer "functional-test-license-usage" in the table

  @addSubscriptionForLabsConsumption
  Scenario: Add a subscription for labs Consumption
    Given I see the customer "functional-test-license-usage" in the table
    And I go to the tekToken Consumption view of "functional-test-license-usage"
    And I open the Add Subscription form from Consumption View
    When I create a subscription with the following data
      | startDate         | 2/27/2023 |
      | renewalDate       | 2/27/2025 |
      | subscriptionType  | Basic     |
      | description       | License2  |
    Then I should see the message "Subscription added successfully!"

  @addLabsConsumptionForMatrix
  Scenario: Add a Labs Consumption for matrix
    Given I see the customer "functional-test-license-usage" in the table
    And I go to the tekToken Consumption view of "functional-test-license-usage"
    And I select subscription "License2"
    And I open the Add Labs Consumption form
    And I open the Add Project form from Consumption form
    And I create a project with the following data
      | startDate         | 2/27/2023   |
      | name              | labsTest    |
      | code              | LAB-001     |
      | subscription      | License2    |
    And I should see the message "Project added successfully!"
    When I add a labs consumption with the following data
      | project           | labsTest                          |
      | dutType           | SBC                               |
      | dutVendor         | Cisco                             |
      | dutDevice         | 1100                              |
      | callingType       | PBX                               |
      | callingVendor     | Grandstream                       |
      | callingDevice     | UCM 6308                          |
      | usageDays         | Fri, Sat                          |
    Then I should see the following data in the tekToken Consumption Summary table
      | tekTokens         | 55          |
      | consumed          | 5           |
      | available         | 50          |
    Then I should see the following data in the tekTokens Project Consumption table
      | project           | labsTest    |
      | status            | Open        |
      | tekTokens         | 5           |
    And I should see the same data in the tekToken Consumption Events table

  @deleteLabsConsumption @delete
  Scenario: Delete labs Consumption
    Given I see the customer "functional-test-license-usage" in the table
    And I go to the tekToken Consumption view of "functional-test-license-usage"
    When I delete the consumption of the project "labsTest"

  @addOtherLicenseConsumption
  Scenario: Add Other Consumption for matrix
    Given I see the customer "functional-test-license-usage" in the table
    And I go to the tekToken Consumption view of "functional-test-license-usage"
    And I open the Add Other Consumption form
    And I open the Add Project form from Consumption form
    And I create a project with the following data
      | startDate         | 2/27/2023   |
      | name              | otherTest   |
      | code              | OTH-001     |
      | subscription      | License2    |
    And I should see the message "Project added successfully!"
    When I add a consumption with the following data
      | project           | otherTest                         |
      | deviceType        | CERT                              |
      | deviceVendor      | tekVizion                         |
      | deviceModel       | Cisco CUCM - FAX                  |
      | deviceVersion     | 1.0                               |
      | deviceGranularity | static                            |
      | tekTokens         | 7                                 |
      | usageDays         | Mon, Tue                          |
    Then I should see the following data in the tekToken Consumption Summary table
      | tekTokens         | 55          |
      | consumed          | 7           |
      | available         | 48          |
    Then I should see the following data in the tekTokens Project Consumption table
      | project           | otherTest   |
      | status            | Open        |
      | tekTokens         | 7           |
    And I should see the same data in the tekToken Consumption Events table

  @deleteLicenseConsumption @delete
  Scenario: Delete other Consumption
    Given I see the customer "functional-test-license-usage" in the table
    And I go to the tekToken Consumption view of "functional-test-license-usage"
    When I delete the consumption of the project "otherTest"

  @deleteCustomerProject @delete
  Scenario: Delete the test licenses customer
    Given I see the customer "functional-test-license-usage" in the table
    When I delete the customer "functional-test-license-usage"
    Then I should see the message "Customer deleted successfully!"