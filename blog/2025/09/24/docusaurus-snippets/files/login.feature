Feature: User login
  Scenario: Valid login
    Given the user is on the login page
    When the user enters valid credentials
    Then they are redirected to the dashboard
