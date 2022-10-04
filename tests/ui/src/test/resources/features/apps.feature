@CTaaSFeature @appsNavigationTests
Feature: AppsNavigation
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login with a subaccount administrator
    And I click on "Not right now" button
    Then I should see the following buttons
      | tekToken Usage |
      | SpotLight      |

  @spotLightNavigation
  Scenario: Test SpotLight Navigation
    Given I am on the apps view
    When I click on "SpotLight" button
    Then I should see the "SpotLight" view
    And I should see the following buttons
      | Dashboard     |
      | Stakeholders  |
    And I logout

  @tokenNavigation
  Scenario: Test tekToken Usage Navigation
    Given I am on the apps view
    When I click on "tekToken Usage" button
    And I should see the "tekVizion 360 Portal" view
    And I click on "tekVizion" button
    Then I am on the apps view
    And I logout