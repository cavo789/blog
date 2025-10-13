/**
 * @Then I click on the :menu menu item
 */
public function iClickOnTheMenuItem(string $menu): void
{
    if (!is_dir('.output')) {
        mkdir('.output', 0777);
    }

    // When entering in the method, take a screenshot so we can assert we're on the homepage
    file_put_contents('.output/homepage.png', $this->getSession()->getDriver()->getScreenshot());

    /**
     * @var $elements Behat\Mink\Element\NodeElement
     */
    $elements = $this->getSession()->getPage()->findAll('css', 'a[class="navbar__item navbar__link"]');

    // Now we'll get all links from our navigation bar. $elements will contain more than one link in our case.
    // The CSS selector has been written using our Web developer console; in Edge or Chromium for instance.
    // Loop any elements (our navigation links) and when we've found the one having `Blog` as text, click on it
    foreach ($elements as $element) {
        if ($element->getText() === $menu) {
            $element->click();
        }
    }

    // Give one second to the website to handle the click and, so, to navigate to, as we expect it, the `/blog` path
    sleep(1);

    // Take a second image, now we should be in the list of posts
    file_put_contents('.output/iClickOnBlog.png', $this->getSession()->getDriver()->getScreenshot());
}
