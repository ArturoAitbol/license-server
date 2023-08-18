@CTaaSFeature @functional-test-suitesTest @feature-toggle
Feature: TestSuites
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page
  
  @addTestSuite @spotLightDashboard
  Scenario: Add a Test Suite for customer
    Given I see the customer "functional-spotlight-customer" in the table
    And I go to the spotlight dashboard for "functional-spotlight-customer"
    And I go to the spotlight "Test Suites" tab
    And I open the Add Test Suite form
    When I create a test suite with the following data
      | suiteName     | Test Suite A |
      | service       | MS Teams     |
      | frequency     | Hourly       |
    Then I should see the message "Test Suite added successfully!"
  
  @editTestSuite @spotLightDashboard
  Scenario: Edit a Test Suite
    Given I see the customer "functional-spotlight-customer" in the table
    And I go to the spotlight dashboard for "functional-spotlight-customer"
    And I go to the spotlight "Test Suites" tab
    When I edit the test suite "Test Suite A" with the following data
      | suiteName     | Test Suite A Updated |
      | service       | MS Teams     |
      | executions    | 10           |
      | nextExecution | 10/20/2022    |      
      | frequency     | Monthly       |
    Then I should see the message "Test Suite successfully edited!"

  @deleteTestSuite @delete @spotLightDashboard
  Scenario: Delete Test Suite A Updated
      Given I see the customer "functional-spotlight-customer" in the table
      And I go to the spotlight dashboard for "functional-spotlight-customer"
      And I go to the spotlight "Test Suites" tab
      And I see the "Test Suite A Updated" test suite in the table
      When I delete the "Test Suite A Updated" test suite
      Then I should see the message "Test suite deleted successfully!"