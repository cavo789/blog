Feature: Clicking on the Blog menu item should gives me the list of articles

  Scenario: I click on the Blog menu
    Given I am on "https://www.avonture.be"
    Then I click on the "Blog" menu item
    Then I should be on "/blog"
