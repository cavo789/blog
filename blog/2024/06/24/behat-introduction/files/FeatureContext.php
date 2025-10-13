<?php

use Behat\Mink\Mink;
use Behat\Mink\Session;
use DMore\ChromeDriver\ChromeDriver;
use Behat\Behat\Tester\Exception\PendingException;

/**
 * Defines application features from the specific context.
 */
class FeatureContext extends \Behat\MinkExtension\Context\MinkContext
{

    private Behat\Mink\Mink $mink;

    /**
     * Initializes context.
     *
     * Every scenario gets its own context instance.
     * You can also pass arbitrary arguments to the
     * context constructor through behat.yml.
     */
    public function __construct()
    {
        $this->mink = new Mink(
            [
                'browser' => new Session(
                    new ChromeDriver(
                        'http://0.0.0.0:9222',
                        null,
                        "https://www.avonture.be"  // <-- Think to update to the site you wish to test
                    )
                )
            ]
        );

    }

    /**
     * @Then I click on the :arg1 menu item
     */
    public function iClickOnTheMenuItem($arg1)
    {
        throw new PendingException();
    }
}
