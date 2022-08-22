@licensesTest
Feature: Licenses

    Background: : Login successfully with valid credentials
        Given I am on the landing page
        When I try to login with email and password
        Then I should see the "Customers" page
    
    @listCustomerLicenses @licenses
    Scenario: List License customer Licenses
        Given I see the customer "customerTest" in the table
        When I click "View tekVizion 360 Packages" option
        Then I should see the "tekVizion 360 Packages" table
        And I wait 3 seconds
    
    @addBasicLicense @licenses
    Scenario: Add Basic license
        Given I open the Add Package form
        When I create a package with the following data
            | startDate     | 8/20/2022 |
            | renewalDate   | 2/20/2023 |
            | packageType   | Basic     |
        Then I see the "Basic" package in the table
        And I wait 5 seconds
    
    @addAddOnLicense @licenses
    Scenario: Add AddOn license
        Given I open the Add Package form
        When I create a package with the following data
            | startDate             | 8/20/2022 |
            | renewalDate           | 2/20/2023 |
            | packageType           | AddOn     |
            | deviceAccessTekTokens | 10        |
            | tekTokens             | 30        |
        Then I see the "AddOn" package in the table
        And I wait 5 seconds

    @deleteBasicLicense @licenses
    Scenario: Delete Basic License
        Given I see the "Basic" package in the table
        Then I delete the "Basic" license
        Then I should see the alert "License deleted successfully!"
        And I wait 3 seconds

    @returnToCustomersPage @licenses
    Scenario: Return to Customers page
        Given I should see the "tekVizion 360 Packages" table
        When I click back button
        Then I wait 3 seconds