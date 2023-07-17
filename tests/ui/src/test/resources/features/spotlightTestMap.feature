@CTaaSFeature @spotLightMapTest
Feature: Stakeholders
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page

  @openNodeInformation @spotLightDashboard @test
  Scenario: Open a node information
    Given I go to spotlight for customer "DashboardFunctionalTest" with subaccount "DashboardFunctionalTest"
    And I go to the spotlight "Map" tab
    Then I open the node of the map

  @validateNodePolqa @spotLightDashboard @test
  Scenario: Validate node POLQA data
    Given I go to spotlight for customer "DashboardFunctionalTest" with subaccount "DashboardFunctionalTest"
    And I go to the spotlight "Map" tab
    Then I validate node avg POLQA of "Chicago" with "Avg: 3.91" and "Avg: 3.89"

  @validateAvgPOLQAInformation @spotLightDashboard @test
  Scenario: Open a node and validate the POLQA value
    Given I go to spotlight for customer "DashboardFunctionalTest" with subaccount "DashboardFunctionalTest"
    And I go to the spotlight "Map" tab
    Then I validate node avg POLQA of "Las Vegas" with "Avg: 3.76" and "Avg: 3.81"

  @validateLinkInformation @spotLightDashboard @test
  Scenario: Open a link and validate information
    Given I go to spotlight for customer "DashboardFunctionalTest" with subaccount "DashboardFunctionalTest"
    And I go to the spotlight "Map" tab
    Then I open a link and validate the data

  @validateFailedInformation @spotLightDashboard @test
  Scenario: Open a link and validate the failed calls
    Given I go to spotlight for customer "DashboardFunctionalTest" with subaccount "DashboardFunctionalTest"
    And I go to the spotlight "Map" tab
    Then I open a link and validate failed calls

  @goToNativeDashboard @spotLightDashboard @test
  Scenario: Open a node and open the native dashboard
    Given I go to spotlight for customer "DashboardFunctionalTest" with subaccount "DashboardFunctionalTest"
    And I go to the spotlight "Map" tab
    Then I open the native dashboard of the "Las Vegas" node

  @filterByRegionAndOpenNode @spotLightDashboard @test
  Scenario: Filter region and open a node
    Given I go to spotlight for customer "DashboardFunctionalTest" with subaccount "DashboardFunctionalTest"
    And I go to the spotlight "Map" tab
    Then I filter by date and "Chicago, IL, United States" and open a node

  @filterByRegionAndOpenLink @spotLightDashboard @test
  Scenario: Filter region and open a link
    Given I go to spotlight for customer "DashboardFunctionalTest" with subaccount "DashboardFunctionalTest"
    And I go to the spotlight "Map" tab
    Then I filter by date and "Chicago, IL, United States" and open a link