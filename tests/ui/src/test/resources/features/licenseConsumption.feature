@licenseConsumptionTest @license
Feature: LicensesConsumption
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page

  @addSubscriptionForConsumption @testing
  Scenario: Add a subscription for the tekToken Consumption
    Given I see the customer "functional-license-customer" in the table
    And I go to the tekToken Consumption view of "functional-license-customer"
    And I open the Add Subscription form from Consumption View
    When I create a subscription with the following data
      | startDate         | 1/01/2023 |
      | renewalDate       | 1/01/2025 |
      | description       | License2  |
      | subscriptionType  | Basic     |
    Then I should see the message "Subscription added successfully!"

  @addLicenseConsumption @testing
  Scenario: Add a tekToken Consumption
    Given I see the customer "functional-license-customer" in the table
    And I go to the tekToken Consumption view of "functional-license-customer"
    And I select subscription "License2"
    And I open the Add tekToken Consumption form
    And I open the Add Project form from Consumption form
    And I create a project with the following data
      | startDate         | 1/01/2023   |
      | name              | tekTokenTest|
      | code              | PRT-001     |
      | subscription      | License2    |
    And I should see the message "Project added successfully!"
    When I add a consumption with the following data
      | project           | tekTokenTest                      |
      | deviceVendor      | Cisco                             |
      | deviceModel       | Contact Center Enterprise (UCCE)  |
      | deviceVersion     | 12.6                              |
      | deviceGranularity | week                              |
      | tekTokens         | 7                                 |
      | usageDays         | Sun, Mon, Tue                     |
    Then I should see the following data in the tekToken Consumption Summary table
      | tekTokens         | 55          |
      | consumed          | 7           |
      | available         | 48          |
    Then I should see the following data in the tekTokens Project Consumption table
      | project           | tekTokenTest|
      | status            | Open        |
      | tekTokens         | 7           |
     And I should see the same data in the tekToken Consumption Events table

  @editLicenseConsumption
  Scenario: Edit a tekToken Consumption
    Given I see the customer "functional-license-customer" in the table
    And I go to the tekToken Consumption view of "functional-license-customer"
    And I select subscription "License2"
    When I edit the consumption of the project "tekTokenTest" with the following data
      | usageDays         | Fri, Sat                          |
      | deviceVendor      | Cisco                             |
      | deviceModel       | Contact Center Express (UCCX)     |
      | deviceVersion     | 12.5                              |
      | deviceGranularity | week                              |
      | tekTokens         | 4                                 |
    Then I should see the message "tekToken consumption successfully edited!"
    Then I should see the following data in the tekToken Consumption Summary table
      | tekTokens         | 55          |
      | consumed          | 4           |
      | available         | 51          |
    Then I should see the following data in the tekTokens Project Consumption table
      | project           | tekTokenTest|
      | status            | Open        |
      | tekTokens         | 4           |
     And I should see the same data in the tekToken Consumption Events table

  @addLicenseConsumptionForSupport
  Scenario: Add a tekToken Consumption for a support device
    Given I see the customer "functional-license-customer" in the table
    And I go to the tekToken Consumption view of "functional-license-customer"
    And I select subscription "License2"
    And I open the Add tekToken Consumption form
    And I open the Add Project form from Consumption form
    And I create a project with the following data
      | startDate         | 1/01/2023   |
      | name              | supportTest |
      | code              | SPT-001     |
      | subscription      | License2    |
    When I add a consumption with the following data
      | project           | supportTest                       |
      | supportVendor     | HylaFAX                           |
      | supportModel      | HylaFAX Enterprise                |
      | deviceVersion     | 6.2                               |
      | deviceGranularity | static                            |
      | tekTokens         | 0                                 |
      | usageDays         | Sun, Mon, Tue                     |
    Then I should see the following data in the tekTokens Project Consumption table
      | project           | supportTest |
      | status            | Open        |
      | tekTokens         | 0           |
     And I should see the same data in the tekToken Consumption Events table

  @editLicenseConsumptionForSupport
  Scenario: Edit the tekToken Consumption for a support device
    Given I see the customer "functional-license-customer" in the table
    And I go to the tekToken Consumption view of "functional-license-customer"
    And I select subscription "License2"
    When I edit the consumption of the project "supportTest" with the following data
      | usageDays         | Sun           |
    Then I should see the following data in the tekTokens Project Consumption table
      | project           | supportTest   |
      | status            | Open          |
      | tekTokens         | 0             |
     And I should see the same data in the tekToken Consumption Events table

  @deleteLicenseConsumption @delete
  Scenario: Delete the tekToken Consumption of a device
    Given I see the customer "functional-license-customer" in the table
    And I go to the tekToken Consumption view of "functional-license-customer"
    And I select subscription "License2"
    When I delete the consumption of the project "tekTokenTest"

  @deleteLicenseConsumptionForSupport @delete
  Scenario: Delete the tekToken Consumption of a support device
    Given I see the customer "functional-license-customer" in the table
    And I go to the tekToken Consumption view of "functional-license-customer"
    And I select subscription "License2"
    When I delete the consumption of the project "supportTest"