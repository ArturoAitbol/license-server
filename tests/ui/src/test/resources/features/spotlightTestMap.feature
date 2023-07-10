@CTaaSFeature @spotLightMapTest
Feature: Stakeholders
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login using a "FullAdministrator"
    Then I should see the "Customers" page

  @openNodeInformation @spotLightDashboard @test
  Scenario: Open a node information
    Given I go to spotlight for "Spotlight Demo-1"
    And I go to the spotlight "Map" tab
    Then I open the node of the map

  @validateNodePolqa @spotLightDashboard @test
  Scenario: Validate node POLQA data
    Given I go to spotlight for "Spotlight Demo-1"
    And I go to the spotlight "Map" tab
    Then I validate node avg POLQA of "Chicago" with "Avg: 3.91" and "Avg: 3.89"

  @validateLinkInformation @spotLightDashboard @test
  Scenario: Open a link and validate information
    Given I go to spotlight for "Spotlight Demo-1"
    And I go to the spotlight "Map" tab
    Then I open a link and validate the data

  @validateFailedInformation @spotLightDashboard @test
  Scenario: Open a link and validate the failed calls
    Given I go to spotlight for "Spotlight Demo-1"
    And I go to the spotlight "Map" tab
    Then I open a link and validate failed calls

  @validateAvgPOLQAInformation @spotLightDashboard @test
  Scenario: Open a node and validate the POLQA value
    Given I go to spotlight for "Spotlight Demo-1"
    And I go to the spotlight "Map" tab
    Then I validate node avg POLQA of "Las Vegas" with "Avg: 3.76" and "Avg: 3.81"