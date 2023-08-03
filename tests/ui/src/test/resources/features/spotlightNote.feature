@CTaaSFeature @spotLightNoteTest
Feature: CtaasSetup
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page

  Scenario: Go to the historical dashboard of a note
    Given I go to the spotlight view of subaccount "DashboardFunctionalTest" of customer "DashboardFunctionalTest"
    And I go to the spotlight "Notes" tab
    When I go to the historical dashboard of the note "Sample note"
    Then I should see the dashboard for the date when the note "Sample note" was created
