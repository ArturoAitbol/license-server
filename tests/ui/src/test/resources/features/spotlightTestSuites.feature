@CTaaSFeature @spotLightTestSuitesTest
Feature: TestSuites
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page
    
  @createTestSuitesCustomer
  Scenario: Create a test customer for test suite tests
    Given I open the Add Customer form
    When I create a customer with the following data
      | name          | SpotlightTestSuite                    |
      | type          | MSP                                   |
      | adminEmail    | spotlight-test-suite@tekvizion.com    |
      | subaccount    | Default                               |
      | subAdminEmail | spotlight-test-suite-sa@tekvizion.com |
      | spotlight     | yes                                   |
      | testCustomer  | yes                                   |
    Then I see the customer "SpotlightTestSuite" in the table
  
  @addTestSuite
  Scenario: Add a Test Suite for customer
    Given I see the customer "SpotlightTestSuite" in the table
    And I go to the spotlight dashboard for "SpotlightTestSuite"
    And I go to the spotlight "Test Suites" tab
    And I open the Add Test Suite form
    When I create a test suite with the following data
      | suiteName     | Test Suite A |
      | service       | MS Teams     |
      | frequency     | Hourly       |
    Then I should see the message "Test Suite added successfully!"
  
  @editTestSuite
  Scenario: Edit a Test Suite
    Given I see the customer "SpotlightTestSuite" in the table
    And I go to the spotlight dashboard for "SpotlightTestSuite"
    And I go to the spotlight "Test Suites" tab
    When I edit the test suite "Test Suite A" with the following data
      | suiteName     | Test Suite A Updated |
      | service       | MS Teams     |
      | executions    | 10           |
      | nextExecution | 10/20/2022    |      
      | frequency     | Monthly       |
    Then I should see the message "Test Suite successfully edited!"

  @deleteTestSuite
  Scenario: Delete Test Suite A Updated
      Given I see the customer "SpotlightTestSuite" in the table
      And I go to the spotlight dashboard for "SpotlightTestSuite"
      And I go to the spotlight "Test Suites" tab
      And I see the "Test Suite A Updated" test suite in the table
      When I delete the "Test Suite A Updated" test suite
      Then I should see the message "Test suite deleted successfully!"

  @deleteTestSuitesCustomer @ignore
  Scenario: Delete the test suites customer
    Given I see the customer "SpotlightTestSuite" in the table
    When I delete the customer "SpotlightTestSuite"
    Then I should see the message "Customer deleted successfully!"