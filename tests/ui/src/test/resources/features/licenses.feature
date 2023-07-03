@licensesTest @license
Feature: Licenses
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page
    
  @addLicense
  Scenario: Add Basic license
    Given I see the customer "functional-license-customer" in the table
    And I go to the Subscriptions view of "functional-license-customer"
    And I should see the "TekVizion 360 Subscriptions" table
    And I open the Add Subscription form
    When I create a subscription with the following data
        | startDate             | 8/20/2022         |
        | renewalDate           | 2/20/2025        |
        | subscriptionType      | Basic             |
        | description           | Description1      |
    Then I see the "Description1" subscription in the table

  @editLicense
  Scenario: Edit to AddOn license
    Given I see the customer "functional-license-customer" in the table
    And I go to the Subscriptions view of "functional-license-customer"
    And I see the "Description1" subscription in the table
    When I edit the subscription "Description1" with the following data
        | description           | LicenseModified   |
        | subscriptionType      | AddOn             |
        | deviceAccessTekTokens | 10                |
        | tekTokens             | 30                |
    Then I should see the message "Subscription edited successfully!"
    And I should see the modified data in Subscriptions table

  @deleteLicense
  Scenario: Delete LicenseModified
    Given I see the customer "functional-license-customer" in the table
    And I go to the Subscriptions view of "functional-license-customer"
    And I see the "LicenseModified" subscription in the table
    When I delete the "LicenseModified" subscription
    Then I should see the message "License deleted successfully!"
