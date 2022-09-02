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
        And I go to the Subscriptions view of "licenseCustomerTest"
        And I should see the "tekVizion 360 Subscriptions" table
        And I open the Add Subscription form
        When I create a subscription with the following data
            | startDate             | 8/20/2022         |
            | renewalDate           | 2/20/2023         |
            | subscriptionType      | Basic             |
            | description           | Description1      |
        Then I see the "Description1" subscription in the table

    @editLicense
    Scenario: Edit to AddOn license
        Given I see the customer "licenseCustomerTest" in the table
        And I go to the Subscriptions view of "licenseCustomerTest"
        And I see the "Description1" subscription in the table
        When I edit the subscription "Description1" with the following data
#            | startDate             | 8/20/2022        |
#            | renewalDate           | 2/20/2023        |
            | description           | LicenseModified   |
            | subscriptionType      | AddOn             |
            | deviceAccessTekTokens | 10                |
            | tekTokens             | 30                |
        Then I should see the message "Subscription edited successfully!"
        And I should see the modified data in Subscriptions table

    @deleteLicense
    Scenario: Delete LicenseModified
        Given I see the customer "licenseCustomerTest" in the table
        And I go to the Subscriptions view of "licenseCustomerTest"
        And I see the "LicenseModified" subscription in the table
        When I delete the "LicenseModified" subscription
        Then I should see the message "License deleted successfully!"

    @deleteCustomerLicense
    Scenario: Delete the test licenses customer
        Given I see the customer "licenseCustomerTest" in the table
        When I delete the customer "licenseCustomerTest"
        Then I should see the message "Customer deleted successfully!"