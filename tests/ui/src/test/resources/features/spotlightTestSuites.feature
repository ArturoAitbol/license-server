@spotLightTestSuitesTest
Feature: TestSuites
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login with email and password
    Then I should see the "Customers" page
    
  @createTestSuitesCustomer
  Scenario: Create a test customer for license consumption tests
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
  Scenario: Add a test suite for customer
    Given I see the customer "SpotlightTestSuite" in the table
    And I go to the spotlight dashboard for "SpotlightTestSuite"
    And I go to the spotlight "Test Suites" tab
    And I open the Add Test Suite form
    When I create a test suite with the following data
      | suiteName     | Test Execution |
      | service       | MS Teams |
      | frequency     | Hourly     |
    Then I should see the message "Test Suite added successfully!"
  
  # @editTestSuite

  # @deleteTestSuitesCustomer @ignore
  # Scenario: Delete the test suites customer
  #   Given I see the customer "SpotlightTestSuite" in the table
  #   When I delete the customer "SpotlightTestSuite"
  #   Then I should see the message "Customer deleted successfully!"