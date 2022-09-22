@CTaaSFeature @appsNavigationTests
Feature: AppsNavigation
  Background: Login successfully with valid credentials
    Given I am on the landing page
    When I try to login with a subaccount administrator
    Then I should see the following buttons
      | tekToken Usage |
      | CTaaS          |

  @ctaasNavigation
  Scenario: Test CTaaS Navigation
    Given I am on the apps view
    When I click on "CTaaS" button
    Then I should see the "CTaaS" view
    And I should see the following buttons
      | Dashboard     |
      | Test Suites   |
      | Stakeholders  |
    And I logout

  @tokenNavigation
  Scenario: Test tekToken Usage Navigation
    Given I am on the apps view
    When I click on "tekToken Usage" button
    And I should see the "tekToken Usage" view
    And I click on "tekVizion" button
    Then I am on the apps view
    And I logout