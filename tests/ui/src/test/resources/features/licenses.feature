@licensesTest
Feature: Licenses

    @validCredentials
    Scenario: Login successfully with valid credentials
        Given I am on the landing page
        When I try to login with email and password
        Then I should see the "Customers" page
    
    @createCustomer
    Scenario: Create a License customer
        Given I open the Add Customer form
        When I create a customer with the following data
            | name          | LicenseCustomerTest                   |
            | type          | Reseller                              |
            | adminEmail    | license-test-admin@tekvizionlabs.com  |
            | subaccount    | licenseSubaccountTest                 |
            | subAdminEmail | license-test-admin@tekvizionlabs.com  |
            | testCustomer  | yes                                   |
        Then I see the customer "LicenseCustomerTest" in the table
        And I wait 5 seconds
    
    @listCustomerLicenses
    Scenario: List License customer Licenses
        Given I see the customer "LicenseCustomerTest" in the table
        When I click "View tekVizion 360 Packages" option
        Then I should see the "tekVizion 360 Packages" table
        And I wait 3 seconds
    
    @addBasicLicense
    Scenario: Add Basic license
        Given I open the Add Package form
        When I create a package with the following data
            | startDate     | 8/20/2022 |
            | renewalDate   | 2/20/2023 |
            | packageType   | Basic     |
        Then I see the "Basic" package in the table
        Then I should see the message "Package added successfully!"
        And I wait 5 seconds
    
    @addAddOnLicense
    Scenario: Add AddOn license
        Given I open the Add Package form
        When I create a package with the following data
            | startDate             | 8/20/2022 |
            | renewalDate           | 2/20/2023 |
            | packageType           | AddOn     |
            | deviceAccessTekTokens | 10        |
            | tekTokens             | 30        |
        Then I see the "AddOn" package with 10 device access tokens and 30 tekTokens
        Then I should see the message "Package added successfully!"
        And I wait 5 seconds

    # @deleteBasicLicense
    # Scenario: Delete Basic License
    #     Given I see the "Basic" package starting "8/20/2022" ending in "2/20/2023" in the table
    #     Then I delete the "Basic" License
    #     And I wait 3 seconds

    @returnToCustomersPage
    Scenario: Return to Customers page
        Given I should see the "tekVizion 360 Packages" table
        When I click back button
        Then I should see the "Customers" page
        And I wait 3 seconds

    @deleteCustomer
    Scenario: Delete a License customer
        Given I see the customer "LicenseCustomerTest" in the table
        When I delete the customer "LicenseCustomerTest"
        Then I should see the message "Customer deleted successfully!"