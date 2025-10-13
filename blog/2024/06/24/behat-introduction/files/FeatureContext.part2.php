/**
 * @Then I click on the :menuItem menu item
 */
public function iClickOnTheMenuItem(string $menuItem): void
{
    if (!is_dir('.output')) {
        mkdir('.output', 0777);
    }

    // When entering in the method, take a screenshot so we can assert we're on the homepage
    file_put_contents('.output/homepage.png', $this->getSession()->getDriver()->getScreenshot());

    throw new PendingException();
}
