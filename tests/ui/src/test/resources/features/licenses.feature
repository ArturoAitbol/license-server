@licensesTest
Feature: Licenses
    Background: : Login successfully with valid credentials
        Given I am on the landing page
        When I try to login with email and password
        Then I should see the "Customers" page

    @createLicenseCustomer
    Scenario: Create a test customer for licenses tests
        Given I open the Add Customer form
        When I create a customer with the following data
            | name          | licenseCustomerTest                   |
            | type          | MSP                                   |
            | adminEmail    | test-license@tekvizionlabs.com        |
            | subaccount    | Default                               |
            | subAdminEmail | license-subaccount@tekvizionlabs.com  |
            | testCustomer  | yes                                   |
        Then I see the customer "licenseCustomerTest" in the table
    
    @addLicense
    Scenario: Add Basic license
        Given I see the customer "licenseCustomerTest" in the table
        And I go to the Packages view of "licenseCustomerTest"
        And I should see the "tekVizion 360 Packages" table
        And I open the Add Package form
        When I create a package with the following data
            | startDate     | 8/20/2022     |
            | renewalDate   | 2/20/2023     |
            | packageType   | Basic         |
            | description   | Description1  |
        Then I see the "Description" package in the table

    @editLicense
    Scenario: Add AddOn license
        Given I see the customer "licenseCustomerTest" in the table
        And I go to the Packages view of "licenseCustomerTest"
        And I see the "Basic" package in the table
        When I edit the package "Basic" with the following data
#            | startDate             | 8/20/2022    |
#            | renewalDate           | 2/20/2023    |
            | packageType           | AddOn         |
            | deviceAccessTekTokens | 10            |
            | tekTokens             | 30            |
            | description           | Description2  |
        Then I should see the message "Package edited successfully!"
        And I should see the modified data in Packages table

    @deleteLicense
    Scenario: Delete Basic License
        Given I see the customer "licenseCustomerTest" in the table
        And I go to the Packages view of "licenseCustomerTest"
        And I see the "AddOn" package in the table
        When I delete the "AddOn" package
        Then I should see the message "License deleted successfully!"

    @deleteCustomerLicense
    Scenario: Delete the test licenses customer
        Given I see the customer "licenseCustomerTest" in the table
        When I delete the customer "licenseCustomerTest"
        Then I should see the message "Customer deleted successfully!"