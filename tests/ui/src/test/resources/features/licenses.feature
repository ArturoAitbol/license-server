@licensesTest
Feature: Licenses

    Background: Login successfully with valid credentials
        Given I am on the landing page
        When I try to login with email and password
        Then I should see the "Customers" page