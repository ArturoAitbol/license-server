@loginTest
Feature: Login

  @validCredentials
  Scenario: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page
#    And I logout