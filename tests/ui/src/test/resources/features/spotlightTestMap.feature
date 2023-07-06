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
    Then I open a node of the map and validate POLQA

  @validateLinkInformation @spotLightDashboard @test
  Scenario: Open a link information
    Given I go to spotlight for "Spotlight Demo-1"
    And I go to the spotlight "Map" tab
    Then I open a node of the map and validate POLQA