@CTaaSFeature @spotLightStakeholdersTest
Feature: Stakeholders
  Background: Login successfully with valid credentials
    Given I am on the landing page

  @addStakeholder @spotLightDashboard @test
  Scenario: Add a Stakeholder
    Given I see the customer "functional-spotlight-customer" in the table
    And I go to the spotlight dashboard for "functional-spotlight-customer"
    And I go to the spotlight "Stakeholders" tab
    And I open the Add Stakeholder form
    When I create a stakeholder with the following data
      | name                | stakeholderTest       |
      | countryPhoneNumber  | Canada                |
      | phoneNumber         | 4168501924            |
      | companyName         | stakeholderCompany    |
      | jobTitle            | Manager               |
    Then I should see the message "Created Stakeholder successfully"
#    And I logout

  @loginStakeholder @ignore @feature-toggle
  Scenario: Stakeholder login
    Given I try to login using a "Stakeholder"
    Then I should see the "SpotLight" view
    And I should see the following buttons
      | Dashboard     |
    And I logout

  @editStakeholder @spotLightDashboard
  Scenario: Edit a StakeHolder
    Given I try to login using a "FullAdministrator"
    And I see the customer "functional-spotlight-customer" in the table
    And I go to the spotlight dashboard for "functional-spotlight-customer"
    And I go to the spotlight "Stakeholders" tab
    When I edit the stakeholder using the following data
      | name                | stakeholderTest         |
      | countryPhoneNumber  | Andorra                 |
      | phoneNumber         | 712345                  |
      | companyName         | testCompany             |
      | jobTitle            | Senior                  |
    Then I should see the message "Updated stake holder details successfully"

  @deleteStakeholder @spotLightDashboard
  Scenario: Delete a Stakeholder
    Given I see the customer "functional-spotlight-customer" in the table
    And I go to the spotlight dashboard for "functional-spotlight-customer"
    And I go to the spotlight "Stakeholders" tab
    And I see the stakeholder in the table
    When I delete the stakeholder
    Then I should see the message "Stakeholder deleted successfully!"

  @deleteTestSuitesCustomer @delete
  Scenario: Delete the test suites customer
    Given I see the customer "functional-spotlight-customer" in the table
    When I delete the customer "functional-spotlight-customer"
    Then I should see the message "Customer deleted successfully!"